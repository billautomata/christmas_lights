module.exports = function Player() {

  var demo_module = {
    name: 'ok',
    data: [{
      interval: 1500,
      data: [1, 0, 0, 0, 0, 0, 0, 1]
    }, {
      data: [0, 0, 0, 0, 0, 0, 1, 0]
    }, {
      data: [0, 0, 0, 0, 0, 0, 1, 1]
    }, {
      interval: 100,
      data: [0, 0, 0, 0, 0, 1, 0, 0]
    }, {
      data: [0, 0, 0, 0, 0, 1, 0, 1]
    }, {
      data: [0, 0, 0, 0, 0, 1, 1, 0]
    }, {
      data: [0, 0, 0, 0, 0, 1, 1, 1]
    }, {
      data: [0, 0, 0, 0, 1, 0, 0, 0]
    }, {
      data: [0, 0, 0, 0, 1, 0, 0, 1]
    }]
  }

  var current_module
  var current_pattern
  var current_interval = 500 // ms
  var current_pattern_index = 0
  var sockets = []

  function set_module(module){
    current_module = module
    set_pattern(current_module)
  }

  function set_pattern(module) {
    current_pattern = module.data
  }

  function save_pattern_to_db() {

  }

  function get_pattern_from_db(id) {

  }

  function tick() {

    var p = current_pattern[current_pattern_index]
    if (p.interval !== undefined) {
      current_interval = p.interval
    }
    p.data.forEach(function (v, i) {
      set_pin(i, v)
    })

    console.log(p.data)

    sockets.forEach(function (s) {
      s.emit('current_index', {
        value: current_pattern_index
      })
    })

    current_pattern_index += 1
    if (current_pattern_index >= current_pattern.length) {
      current_pattern_index = 0
    }

    setTimeout(tick, current_interval)

  }

  function start() {
    set_module(demo_module)
    tick()
  }

  function set_pin(pin, v) {
    // gpio[pin].set(v)
  }

  return {
    get_pattern_from_db: get_pattern_from_db,
    save_pattern: save_pattern_to_db,
    start: start,
    tick: tick,
    set_pattern: set_pattern,
    set_module: set_module,
    current_pattern: function () {
      return current_pattern
    },
    current_module: function(){
      return current_module
    },
    set_sockets: function (s) {
      sockets = s
    },
    current_pattern_index: function(){
      return current_pattern_index
    }
  }

}
