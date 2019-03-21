/**
 * Wrapper for {@link https://forge.autodesk.com/en/docs/viewer/v6/reference/javascript/viewer3d|Viewer3D}
 * with a collection of helpful methods that are not (yet) part of the official API.
 */
class PowerViewer {

    /**
     * Callback function used to report access token to the viewer.
     * @callback AccessTokenCallback
     * @param {string} token Access token.
     * @param {int} expires Number of seconds after which the token expires.
     */

    /**
     * Callback function used by the viewer to request new access token.
     * @callback AccessTokenRequest
     * @param {AccessTokenCallback} callback Access token callback.
     */

    /**
     * Initializes new instance of {@link PowerViewer}, including the initialization
     * of the underlying {@link https://forge.autodesk.com/en/docs/viewer/v6/reference/javascript/viewer3d|Viewer3D}.
     * @param {HTMLElement} container Target container for the viewer canvas.
     * @param {AccessTokenRequest} getAccessToken Function that will be called by the viewer
     * whenever a new access token is required.
     * @returns {Promise<PowerViewer>} Promise that will be either resolved with {@see PowerViewer},
     * or rejected with an error message.
     * 
     * @example <caption>Using Promises</caption>
     * function getAccessToken(callback) {
     *   fetch('/api/forge/auth/token')
     *     .then(resp => resp.json())
     *     .then(json => callback(json.access_token, json.expires_in));
     * }
     * PowerViewer.Initialize(document.getElementById('viewer'), getAccessToken)
     *   .then(powerViewer => console.log(powerViewer));
     * 
     * @example <caption>Using Async/Await</caption>
     * async function getAccessToken(callback) {
     *   const resp = await fetch('/api/forge/auth/token');
     *   const json = await resp.json();
     *   callback(json.access_token, json.expires_in);
     * }
     * async function init() {
     *   const powerViewer = await PowerViewer.Initialize(document.getElementById('viewer'), getAccessToken);
     *   console.log(powerViewer);
     * }
     * init();
     */
    static Initialize(container, getAccessToken) {
        return new Promise(function(resolve, reject) {
            const options = {
                getAccessToken
            };
            Autodesk.Viewing.Initializer(options, function() {
                const viewer = new Autodesk.Viewing.Private.GuiViewer3D(container);
                viewer.start();
                resolve(new PowerViewer(viewer));
            });
        });
    }

    /**
     * Initializes {@link PowerViewer} with existing instance
     * of {@link https://forge.autodesk.com/en/docs/viewer/v6/reference/javascript/viewer3d|Viewer3D}.
     * @param {Viewer3D} viewer Forge viewer.
     */
    constructor(viewer) {
        this.viewer = viewer;
        this.impl = viewer.impl;
    }

    /**
     * Opens a viewable model from document.
     * @param {string} documentUrn Base64-encoded identifier of the document.
     * @param {string|number} [viewableId=0] Optional GUID (string) or index (number) of the viewable within the document.
     * @returns {Promise<Viewable>} Promise that will be either resolved with {@see Viewable} structure,
     * or rejected with an error message.
     */
    load(documentUrn, viewableId = 0) {
        const viewer = this.viewer;
        return new Promise(function(resolve, reject) {    
            function onDocumentLoadSuccess(doc) {
                if (typeof viewableId === 'string') {
                    const viewable = doc.getRoot().findByGuid(viewableId);
                    if (viewable) {
                        viewer.loadDocumentNode(doc, viewable);
                        resolve(viewable);
                    } else {
                        reject(`Viewable ${viewableId} not found.`);
                    }
                } else {
                    const viewables = doc.getRoot().search({ type: 'geometry' });
                    if (viewableId < viewables.length) {
                        const viewable = viewables[viewableId];
                        viewer.loadDocumentNode(doc, viewable);
                        resolve(viewable);
                    } else {
                        reject(`Viewable ${viewableId} not found.`);
                    }
                }
            }
            function onDocumentLoadError(errorCode, errorMsg) {
                reject(`Document loading error: ${errorMsg} (${errorCode})`);
            }
            Autodesk.Viewing.Document.load('urn:' + documentUrn, onDocumentLoadSuccess, onDocumentLoadError);
        });
    }

    /**
     * Finds all scene objects on specific X,Y position on the canvas.
     * @param {number} x X-coordinate, i.e., horizontal distance (in pixels) from the left border of the canvas.
     * @param {number} y Y-coordinate, i.e., vertical distance (in pixels) from the top border of the canvas.
     * @returns {Intersection[]} List of intersections.
     */
    rayCast(x, y) {
        let intersections = [];
        this.impl.castRayViewport(this.impl.clientToViewport(x, y), false, null, null, intersections);
        return intersections;
    }

    addCustomMesh(mesh, overlay = 'PowerViewerOverlay') {
        if (!this.impl.overlayScenes[overlay]) {
            this.impl.createOverlayScene(overlay);
        }
        this.impl.addOverlay(overlay, mesh);
    }

    removeCustomMesh(mesh, overlay = 'PowerViewerOverlay') {
        if (!this.impl.overlayScenes[overlay]) {
            this.impl.createOverlayScene(overlay);
        }
        this.impl.removeOverlay(overlay, mesh);
    }
}
