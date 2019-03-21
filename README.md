# Forge Power Viewer

Collection of helpful tools for [Autodesk Forge Viewer](https://forge.autodesk.com/en/docs/viewer)
that are not (yet) part of its official [API](https://forge.autodesk.com/en/docs/viewer/v6/reference/javascript/viewer3d).

## Why?

During [Forge Accelerator](http://autodeskcloudaccelerator.com) events, there are often recurring themes
of features that the attendees want to build, for example, finding a scene object under the mouse cursor,
or being able to change the transform of an object. Unfortunately, many of these features cannot be built
using the official [APIs](https://forge.autodesk.com/en/docs/viewer/v6/reference/javascript/viewer3d),
sending developers into the dreaded, undocumented area of internal APIs, also known as `viewer.impl`.

The goal of this wrapper library is to:
- provide best practice examples of using the official APIs
- show how commonly requested features can be implemented, for now, using `viewer.impl`
- provide more documentation to both the official and the `viewer.impl` APIs
- collect feedback for the [Forge Viewer](https://forge.autodesk.com/en/docs/viewer) dev team

## Usage

Drop the library in your webpage. You can either use the latest `master` version:

```html
<script src="https://raw.githubusercontent.com/petrbroz/forge-power-viewer/master/src/PowerViewer.js"></script>
```

Or a specific tagged version, for example `v0.1.0`:

```html
<script src="https://raw.githubusercontent.com/petrbroz/forge-power-viewer/v0.1.0/src/PowerViewer.js"></script>
```

> Similarly, the documentation is available both for the latest [master](https://petrbroz.github.io/forge-power-viewer/master/index.html)
> version and for all tagged versions, for example, [0.1.0](https://petrbroz.github.io/forge-power-viewer/0.1.0/index.html).

Start usinig the `PowerViewer` class, either by wrapping an existing instance
of [Viewer3D](https://forge.autodesk.com/en/docs/viewer/v6/reference/javascript/viewer3d):

```js
const powerViewer = new PowerViewer(viewer3d);
powerViewer.load("your-urn");
```

Or by initializing everything using the static method `PowerViewer.Initialize`:

```html
<div id="viewer"></div>
<script>
  async function getAccessToken(callback) {
      const resp = await fetch('/api/auth');
      const json = await resp.json();
      callback(json.access_token, json.expires_in);
  }
  async function run() {
      try {
          const powerViewer = await PowerViewer.Initialize(document.getElementById('viewer'), getAccessToken);
          const viewable = await powerViewer.load("your-urn");
          console.log('Viewable loaded successfully', viewable);
      } catch(err) {
          console.error(err);
      }
  }
  run();
</script>
```

## Development

- install dependencies: `npm install`
- build code documentation: `npm run build:docs`
- running the examples
  - you need two things: Forge app _credentials_, and an _urn_ of a model to view
    - you can create a free Forge app at https://forge.autodesk.com
    - to upload and translate a model for viewing, see the official [tutorial](https://forge.autodesk.com/en/docs/model-derivative/v2/tutorials/prepare-file-for-viewer)
  - run the example server with your Forge credentials:
  `FORGE_CLIENT_ID=<client_id> FORGE_CLIENT_SECRET=<client_secret> node examples/server.js`
  - open one of the example html files with an urn of your model as a url query,
  for example: http://localhost:3000/basic.html?dXyabcdefgh
