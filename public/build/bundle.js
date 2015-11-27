(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var d3 = window.d3
var current_module = {}
var current_pattern = []
var s = window.socket

s.emit('get_current_pattern', { empty: true })

s.on('current_pattern', function (d) {
  console.log(d)
  current_module = d
  current_pattern = current_module.data

  d3.select('div#main').selectAll('*').remove()

  var parent = d3.select('div#main').append('div')
  var footer = d3.select('div#main').append('div')
  var btn_add_row = footer.append('div')
    .attr('id', 'footer')
    .attr('class', 'btn btn-info col-xs-10 col-xs-offset-1')
    .html('add row')

  btn_add_row.on('click', function () {
    current_module.data.push({data: [0, 0, 0, 0, 0, 0, 0, 0]})
    s.emit('new_module', current_module)
    render_module(parent)
  })

  render_module(parent)
})

s.on('current_index', function (d) {
  d3.selectAll('div.pattern_row').style('background-color', 'rgba(0,0,0,0)')
  d3.select('div#pattern_' + d.value).style('background-color', 'rgba(82,155,82,1)')
})

function render_module (parent) {
  console.log('render called')

  parent.selectAll('*').remove()
  parent.append('h2').html(current_module.name)

  current_pattern.forEach(function (row, row_idx) {
    var local = parent.append('div')
      .attr('class', 'col-xs-12 pattern_row')
      .attr('id', 'pattern_' + row_idx)

    row.data.forEach(function (element, idx) {
      var btn = local.append('div').attr('class', 'btn btn-primary col-xs-1').html('&nbsp')
      if (element === 0) {
        btn.attr('class', 'btn btn-default col-xs-1')
      }
      btn.on('click', function () {
        var v = current_pattern[row_idx].data[idx]

        // reverse the state of the data
        if (v === 0) {
          v = 1
        } else {
          v = 0
        }

        current_pattern[row_idx].data[idx] = v

        if (v === 0) {
          btn.attr('class', 'btn btn-default col-xs-1')
        } else {
          btn.attr('class', 'btn btn-primary col-xs-1')
        }

        // send the new pattern to the server
        s.emit('new_module', current_module)
      })
    })

    var interval = local.append('div')
      .append('input').attr('class', 'col-xs-2')
      .attr('type', 'text')

    interval.on('keyup', function () {
      // console.log(d3.select(this).property('value'))
      var v = parseInt(d3.select(this).property('value'), 10)
      // console.log(v)
      if (isNaN(v)) {
        console.log('NAN!')
        delete current_pattern[row_idx].interval
      } else {
        current_pattern[row_idx].interval = v
      }
      console.log(current_pattern[row_idx])
      s.emit('new_module', current_module)
    })

    if (row.interval !== undefined) {
      interval.attr('value', row.interval)
    }

    var killrow = local.append('div').attr('class', 'btn btn-danger col-xs-offset-1 col-xs-1').html('&nbsp')
    killrow.on('click', function () {
      current_module.data = current_module.data.filter(function (e, i) {
        return i !== row_idx
      })
      current_pattern = current_module.data
      s.emit('new_module', current_module)
      render_module(parent)
    })
  })
}

},{}]},{},[1]);
