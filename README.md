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
* [ ] add row
* [ ] delete row
* [ ] list patterns
* [ ] write pattern button (triggers a database save)

#### server
* [ ] write pattern to db
* [ ] read patterns from db
