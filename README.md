# christmas_lights

Raspberry Pi christmas lights sequencer and and browser based pattern editor.  View, edit, play, save, and restore patterns from the database.  Supports 8 channels of lights.  No pattern length limit. Multiple speeds per pattern.  Realtime web-sockets based editing.

<img width="1006" alt="screen shot 2015-11-29 at 8 18 47 am" src="https://cloud.githubusercontent.com/assets/432483/11458301/0189ec02-9672-11e5-9176-a07418a28de8.png">

#### requires
* nodejs v4
* mongodb
* 5V relay module [amazon link](http://www.amazon.com/gp/product/B00C8O9KHA?psc=1&redirect=true&ref_=oh_aui_search_detailpage)
* Raspberry Pi Model B+ (2014) [amazon link](http://www.amazon.com/Raspberry-Pi-Model-512MB-Computer/dp/B00LPESRUK) (reference implementation)

`npm install`

`npm run create_keys`

`npm run https` or `npm run http` for local development

`npm run rpi_https` or `npm run rpi_http` for when it is running on the raspberry pi

Requires mongodb for storing patterns.

`brew install mongodb` (osx) or `sudo apt-get install mongodb-server` (linux)

### assembly instructions

![model b plus pinout](public/pinout_layout_model_bplus.png)

# pattern structure

Unique by name.

```javascript
var pattern = {
  name: 'ok',
  data: [
    { interval: 180, data: [0,1,1,0,0,0,0] },
    { data: [0,0,1,1,0,1,0] },
    { interval: 120, data: [0,1,1,0,1,0,1] }
  ]
}
```

#### client
* [x] add row
* [x] delete row
* [x] list patterns
* [x] write pattern button (triggers a database save)
* [ ] delete pattern button (triggers a database remove)
* [ ] make pretty
* [ ] write docs
* [ ] insert row

#### server
* [x] write pattern to db
* [x] read patterns from db by name
* [x] list patterns in db
* [x] standardize launch and inputs for first run
