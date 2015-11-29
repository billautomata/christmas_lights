var mongojs = require('mongojs')

var db = mongojs('lights', ['patterns'])
db.on('error', function (err) {
  console.log('database error', err)
})
db.on('connect', function () {
  console.log('database connected')
})

module.exports = function Player() {

  var demo_module = {
    name: 'demo',
    data: [{
      interval: 1500,
      data: [1, 0, 0, 0, 0, 0, 0, 1]
    }, {
      data: [0, 1, 0, 0, 0, 0, 1, 0]
    }, {
      data: [0, 0, 1, 0, 0, 0, 1, 1]
    }, {
      interval: 100,
      data: [0, 0, 0, 1, 0, 1, 0, 0]
    }, {
      data: [1, 1, 1, 1, 0, 1, 0, 1]
    }, {
      data: [1, 0, 0, 0, 0, 1, 1, 0]
    }, {
      data: [1, 0, 1, 0, 0, 1, 1, 1]
    }, {
      data: [0, 0, 1, 1, 1, 0, 0, 0]
    }, {
      data: [0, 1, 1, 0, 1, 0, 0, 1]
    }]
  }

  var current_module
  var current_pattern
  var current_interval = 500 // ms
  var current_pattern_index = 0
  var sockets = []
  var gpio
  var pins = []

  function set_module(module){
    current_module = module
    set_pattern(current_module)
  }

  function set_pattern(module) {
    current_pattern = module.data
  }

  function save_pattern_to_db(callback) {

    // try to find the pattern in the repo, if it doesn't exist save it
    // if it does exist update it

    db.patterns.find({ name: current_module.name }, function(err,docs){
      if(docs.length === 0){
        db.patterns.save( { name: current_module.name, data: current_module.data } , function(){
          console.log('pattern ', current_module.name, ' saved to db as new element')
          if(callback){
            callback()
          }
        } )
      } else {
        db.patterns.update({ name: current_module.name }, { $set: { data: current_module.data }}, function(err){
          console.log(err)
          console.log('pattern ', current_module.name, ' UPDATED to db')
          if(callback){
            callback()
          }
        })
      }
    })

    // db.patterns.find({
    //     $query: {},
    //     $orderby: {
    //       _id: -1
    //     },
    //   }, {}, {
    //     limit: 250
    //   },
    //   function (err, data) {
    //     if (err) {
    //       console.log('error')
    //       console.log(err)
    //         // res.status(500)
    //     } else {
    //       console.log(data.length + ' elements returned - latest')
    //         // res.status(200).json(data)
    //     }
    //   })

  }

  function list_patterns(callback){
    db.patterns.find({}, function(err,docs){
      var names = []
      docs.forEach(function(d){
        if(d.name){
          names.push(d.name)
        }
      })
      callback(names)
    })
  }

  function get_pattern_from_db(_name, callback) {
    db.patterns.find({ name: _name }, function(err,docs){
      if(docs.length !== 0){
        callback(docs[0])
      }
    })
  }

  function tick() {

    if (current_pattern_index >= current_pattern.length) {
      current_pattern_index = 0
    }

    var p = current_pattern[current_pattern_index]
    if (p.interval !== undefined) {
      current_interval = p.interval
    }
    p.data.forEach(function (v, i) {
      if(v === 0){
        set_pin(i, true)
      } else {
        set_pin(i, false)
      }

    })

    console.log(p.data)

    sockets.forEach(function (s) {
      s.emit('current_index', {
        value: current_pattern_index
      })
    })

    current_pattern_index += 1

    setTimeout(tick, current_interval)

  }

  function start() {

    db.patterns.find({ name: 'demo' }, function(err,docs){

      console.log(err,docs)
      // return;

      if(docs.length === 0){
        console.log('nothing in the database, initializing with the demo pattern')
        set_module(demo_module)
      } else {
        console.log('got the pattern from the database')
        set_module(docs[0])
      }
      tick()

    })

  }

  function set_pin(pin, v) {
    // gpio[pin].set(v)
    if(gpio !== undefined){
      if(pins[pin] !== undefined){
        gpio.write(pins[pin], v)
      }
    }
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
    },
    set_gpio: function(g,p){
      gpio = g
      pins = p
    },
    list_patterns: list_patterns
  }

}
