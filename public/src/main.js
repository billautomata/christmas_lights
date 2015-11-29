var d3 = window.d3
var current_module = {}
var current_pattern = []
var s = window.socket
var div_sequencer

s.emit('get_current_pattern', { empty: true })

s.on('current_pattern', function (d) {
  console.log('on current pattern')
  console.log(d)
  current_module = d
  current_pattern = current_module.data

  d3.select('div#main').selectAll('*').remove()

  div_sequencer = d3.select('div#main').append('div')
  var footer = d3.select('div#main').append('div')
  var btn_add_row = footer.append('div')
    .attr('id', 'footer')
    .attr('class', 'btn btn-info col-xs-10 col-xs-offset-1')
    .html('add row')

  btn_add_row.on('click', function () {
    current_module.data.push({data: [0, 0, 0, 0, 0, 0, 0, 0]})
    s.emit('new_module', current_module)
    render_sequencer_controls()
  })

  var all_buttons = d3.select('div#main')
    .append('div')
    .attr('class', 'col-xs-12 patterns_parent')

  s.emit('list_patterns')

  s.on('all_patterns', function (d) {
    console.log('got patterns', d)
    d.forEach(function (name) {
      var btn = all_buttons.append('div').attr('class', 'col-xs-2 btn btn-primary').html(name)
      btn.on('click', function () {
        s.emit('load_pattern_from_db', { value: name })
      })
    })
  })

  render_sequencer_controls()
})

s.on('current_index', function (d) {
  d3.selectAll('div.pattern_row').style('background-color', 'rgba(0,0,0,0)')
  d3.select('div#pattern_' + d.value).style('background-color', 'rgba(144,144,144,1)')
})

function render_sequencer_controls () {
  console.log('render called')

  div_sequencer.selectAll('*').remove()

  // setup the name of the module
  var input_name = div_sequencer.append('div')
    .style('font-size', '24px')
    .append('input').attr('type', 'text').attr('class', 'col-xs-8 text-left')
    .attr('value', current_module.name)

  input_name.on('keyup', function () {
    var v = d3.select(this).property('value')
    current_module.name = v
    s.emit('new_module', current_module)
  })

  var save_button = div_sequencer.append('div').attr('class', 'col-xs-2 btn btn-info').html('save to db')

  save_button.on('click', function () {
    s.emit('save_to_db')
  })

  // draw each row of buttons

  // draw labels
  var div_labels = div_sequencer.append('div')
    .attr('class', 'col-xs-12 labels text-center')

  current_pattern[0].data.forEach(function (channel, channel_idx) {
    console.log(channel_idx)
    div_labels.append('div').attr('class', 'col-xs-1').html('ch ' + (channel_idx + 1))
  })

  div_labels.append('div').attr('class', 'col-xs-2').html('interval')
  div_labels.append('div').attr('class', 'col-xs-2').html('delete row')

  current_pattern.forEach(function (row, row_idx) {
    var local = div_sequencer.append('div')
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

    var killrow = local.append('div').attr('class', 'btn btn-danger col-xs-2').html('&nbsp')
    killrow.on('click', function () {
      current_module.data = current_module.data.filter(function (e, i) {
        return i !== row_idx
      })
      current_pattern = current_module.data
      s.emit('new_module', current_module)
      render_sequencer_controls(div_sequencer)
    })
  })
}
