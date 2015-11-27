module.exports = function Player(){

  var current_pattern = demo_pattern
  var current_interval = 500      // ms
  var current_pattern_index = 0

  function set_pattern(pattern){
    current_pattern = pattern
  }

  function save_pattern_to_db(){

  }

  function get_pattern_from_db(id){

  }

  function tick(){

    var p = current_pattern[current_pattern_index]
    if(p.interval !== undefined){
      current_interval = p.interval
    }
    p.data.forEach(function(v,i){
      set_pin(i,v)
    })

    console.log(p.data)

    current_pattern_index += 1
    if(current_pattern_index >= current_pattern.length){
      current_pattern_index = 0
    }

    setTimeout(tick, current_interval)

  }

  function start(){
    set_pattern(demo_pattern)
    tick()
  }

  function set_pin(pin,v){
    // gpio[pin].set(v)
  }

  return {
    set_pattern: set_pattern,
    save_pattern: save_pattern_to_db,
    get_pattern_from_db: get_pattern_from_db,
    tick: tick,
    start: start,
  }

}

var demo_pattern = [
  { interval: 1500, data: [0,0,0,0,0,0,0,1] },
  { data: [0,0,0,0,0,0,1,0] },
  { data: [0,0,0,0,0,0,1,1] },
  { interval: 100, data: [0,0,0,0,0,1,0,0] },
  { data: [0,0,0,0,0,1,0,1] },
  { data: [0,0,0,0,0,1,1,0] },
  { data: [0,0,0,0,0,1,1,1] },
  { data: [0,0,0,0,1,0,0,0] },
  { data: [0,0,0,0,1,0,0,1] }
]
