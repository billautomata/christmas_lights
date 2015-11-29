# christmas_lights

`npm install`

`npm run create_keys`

`npm run https` or `npm run http`


# pattern structure

Array of objects

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

* [ ] make pretty

#### server
* [x] write pattern to db
* [x] read patterns from db by name
* [x] list patterns in db

* [ ] standardize launch and inputs for first run
