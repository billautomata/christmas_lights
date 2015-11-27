// var $ = window.$
var d3 = window.d3

var current_module = {}
var current_pattern = []
// var current_pattern_index = 0
// var current_interval = 0

var s = window.socket

s.emit('get_current_pattern', { empty: true })

s.on('current_pattern', function (d) {
  console.log(d)

  current_module = d
  current_pattern = current_module.data

  var parent = d3.select('div#main')

  current_pattern.forEach(function (row, pattern_idx) {
    var local = parent.append('div')
      .attr('class', 'col-xs-12 pattern_row')
      .attr('id', 'pattern_' + pattern_idx)

    row.data.forEach(function (element, idx) {
      var btn = local.append('div').attr('class', 'btn btn-primary col-xs-1').html('&nbsp')
      if (element === 0) {
        btn.attr('class', 'btn btn-default col-xs-1')
      }
      btn.on('click', function () {
        var v = current_pattern[pattern_idx].data[idx]

        // reverse the state of the data
        if (v === 0) {
          v = 1
        } else {
          v = 0
        }

        console.log(current_pattern[pattern_idx].data[idx], v)
        current_pattern[pattern_idx].data[idx] = v

        if (v === 0) {
          btn.attr('class', 'btn btn-default col-xs-1')
        } else {
          btn.attr('class', 'btn btn-primary col-xs-1')
        }

        // send the new pattern to the server
        s.emit('new_module', current_module)
      })
    })

    var interval = local.append('div').attr('class', 'col-xs-1')
      .append('input')
      .attr('type', 'text')

    interval.on('keyup', function () {
      // console.log(d3.select(this).property('value'))
      var v = parseInt(d3.select(this).property('value'), 10)
      // console.log(v)
      if (isNaN(v)) {
        console.log('NAN!')
        delete current_pattern[pattern_idx].interval
      } else {
        current_pattern[pattern_idx].interval = v
      }
      console.log(current_pattern[pattern_idx])
      s.emit('new_module', current_module)
    })

    if (row.interval !== undefined) {
      interval.attr('value', row.interval)
    }
  })
})

s.on('current_index', function (d) {
  d3.selectAll('div.pattern_row').style('background-color', 'white')
  d3.select('div#pattern_' + d.value).style('background-color', 'blue')
})
