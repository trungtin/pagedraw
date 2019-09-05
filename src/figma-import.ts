/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let figma_import;
import _ from 'underscore';
import _l from 'lodash';
import murmurHash from 'number-generator/lib/murmurhash3_x86_32';
import { assert } from './util';
import Block from '../src/block';
import TextBlock from './blocks/text-block';
import { InstanceBlock } from './blocks/instance-block';
import ArtboardBlock from './blocks/artboard-block';
import LayoutBlock from './blocks/layout-block';
import ImageBlock from './blocks/image-block';
import OvalBlock from "./blocks/oval-block";
import { Doc } from './doc';
import { Model } from './model';
import { fontsByName, LocalUserFont } from './fonts';
import { Dynamicable } from './dynamicable';

const isImage = node => {
    if (__guard__(node.fills != null ? node.fills[0] : undefined, x => x.type) === "IMAGE") { return true; }
    return false;
};

class EventualImageBlock {
    constructor({top, left, width, height, id}) {
        this.top = top;
        this.left = left;
        this.bottom = top + height;
        this.right = left + width;
        this.width = width;
        this.height = height;
        this.id = id;
    }
}

class EventualInstanceBlock {
    constructor({top, left, width, height, componentId}) {
        this.top = top;
        this.left = left;
        this.bottom = top + height;
        this.right = left + width;
        this.width = width;
        this.height = height;
        this.componentId = componentId;
    }
}

const createShadow = effect => {
    const {r,g,b,a} = effect.color;

    return new (Model.tuple_named['box-shadow'])({
        color: `rgba(${r*255},${g*255},${b*255},${a})`,
        offsetX: effect.offset.x,
        offsetY: effect.offset.y,
        blurRadius: effect.radius,
        spreadRadius: 0
    });
};

const createBasicBlockAttrs = node => {
    const boundingBox = node.absoluteBoundingBox;
    return{
        uniqueKey: figmaToPagedrawKey(node.id),
        name: node.name,
        top: boundingBox.y,
        left: boundingBox.x,
        width: boundingBox.width,
        height: boundingBox.height
    };
};

const createLayoutBlock = node => {
    let a, b, g, r;
    const boundingBox = node.absoluteBoundingBox;
    const block = new LayoutBlock(createBasicBlockAttrs(node));

    if (_l.isEmpty(node.fills)) {
        set_dyn_attr(block, 'color', `rgba(${r*255},${g*255},${b*255},0)`, node.id);
    }

    if (__guard__(node.fills != null ? node.fills[0] : undefined, x => x.type) === "SOLID") {
        ({r, g, b, a} = node.fills[0].color);
        set_dyn_attr(block, 'color', `rgba(${r*255},${g*255},${b*255},${a * (node.opacity != null ? node.opacity : 1) * (node.fills[0].opacity != null ? node.fills[0].opacity : 1)})`, node.id);
    }

    if (__guard__(node.strokes != null ? node.strokes[0] : undefined, x1 => x1.type) === "SOLID") {
        ({r, g, b, a} = node.strokes[0].color);
        block.borderColor = `rgba(${r*255},${g*255},${b*255},${a * (node.opacity != null ? node.opacity : 1)* (node.strokes[0].opacity != null ? node.strokes[0].opacity : 1)})`;
        block.borderThickness = node.strokeWeight;
        if (block.strokeAlign === "OUTSIDE") {
            block.left -= block.borderThickness;
            block.top -= block.borderThickness;
            block.width += (block.borderThickness * 2);
            block.height += (block.borderThickness * 2);
        }
    }

    for (let effect of Array.from(node.effects)) {
        if (effect.visible !== false) {
            if (effect.type === "DROP_SHADOW") {
                block.outerBoxShadows.push(createShadow(effect));
            } else if (effect.type === "INNER_SHADOW") {
                block.innerBoxShadows.push(createShadow(effect));
            }
        }
    }

    return block;
};

var figmaToPagedrawKey = figmaKey => murmurHash(figmaKey).toString().padStart(15, "0");


var set_dyn_attr = function(block, prop, value, blockUniqueKey) {
    // as a safety precaution, don't allow undefined staticValues.
    // See comment for set_dyn_attr in sketch-importer/importer
    if ((value != null) === false) { return; }

    block[prop].staticValue = value;
    return block[prop].uniqueKey = figmaToPagedrawKey(blockUniqueKey + prop);
};


const defaultExport = {};


defaultExport.figma_import = (figma_import = function(figma_url, apiKey) {
    let [is_staging, fileId] = Array.from([null, null]); // declared up here so all promise.thens can get them
    let [eventualImageBlocks, nonImageBlocks] = Array.from([null, null]);
    let idImageHash = null;
    let fileName = null;


    const figma_rpc = function(route) {
        assert(() => route.startsWith('/'));
        const figma_api_domain = !is_staging ? "https://api.figma.com" : "https://staging-api.figma.com";
        return fetch(`${figma_api_domain}/v1${route}`, {
            headers: new Headers({"Authorization": `Bearer ${apiKey}`}),
            mode: 'cors'
        }).then(resp => resp.json());
    };

    return (new Promise(function(resolve, reject) {
        // the regex .match with throw if it's not a valid url
        // this is good because it means the the promise returned from figma_import will reject
        let match, staging_url_part;
        [match, staging_url_part, fileId, fileName] = Array.from(figma_url.match(new RegExp(`^https://(?:www\\.)?(staging\\.)?figma\\.com/file/(.*)/(.*)$`)));
        is_staging = (staging_url_part != null) ? true : false;
        return resolve();
    }))
    .then(() => figma_rpc(`/files/${fileId}`))
    .then(function(figmaFile) {
        const spaceBetweenPages = 140;
        let nextPageStart = 100;
        const blocks = _l.flatten(figmaFile.document.children.map(canvas => {
             // get the independent frame of the page
            const blocksInPage = importCanvas(canvas);
            const pageOuterGeometry = Block.unionBlock(blocksInPage);

            // skip this page if it's empty
            if (pageOuterGeometry === null) { return []; }

            // move the blocks in the page to their place in the unified page
            const deltaY = nextPageStart - pageOuterGeometry.top;
            for (let block of Array.from(blocksInPage)) { block.top += deltaY; }

            // start the next page space_between_pages pixels after the last page
            nextPageStart = nextPageStart + pageOuterGeometry.height + spaceBetweenPages;

            return blocksInPage;
        })
        );

        const fonts = blocks.filter(b => b instanceof TextBlock).map(b => b.fontFamily);

        const [minLeft, minTop] = Array.from([_l.min(_l.map(blocks, 'left')), _l.min(_l.map(blocks, 'top'))]);
        for (let block of Array.from(blocks)) {
            block.left += 100 - minLeft;
            block.top += 100 - minTop;
        }

        [eventualImageBlocks, nonImageBlocks] = Array.from(_l.partition(blocks, b => b instanceof EventualImageBlock));
        if (_l.isEmpty(eventualImageBlocks)) { return []; }
        const imageBlockIds = eventualImageBlocks.map(b => b.id);
        idImageHash = _l.keyBy(eventualImageBlocks, b => b.id);

        return figma_rpc(`/images/${fileId}?ids=${imageBlockIds.join(',')}\&scale=1\&format=svg`).then(function({err, images}) {
            if (err != null) { throw new Error(err); }
            return images;
        });}).then(function(images) {
        // Mutate image blocks to give them a source
        _l.each(images, (value, key) => { return idImageHash[key].image = (Dynamicable(String)).from(value); });
        const imageBlocks = eventualImageBlocks.map(eventualImageBlock => {
            return new ImageBlock({
                uniqueKey: eventualImageBlock.uniqueKey,
                top: eventualImageBlock.top,
                left: eventualImageBlock.left,
                height: eventualImageBlock.height,
                width: eventualImageBlock.width,
                image: eventualImageBlock.image
            });
        });

        return {doc_json: new Doc({blocks: nonImageBlocks.concat(imageBlocks), figma_url}).serialize(), fileName};});
});


export default defaultExport;


var importCanvas = canvas => {
    const componentHash = {};

    var importNode = (node, insideArtboard) => {
        let a, b, block, g, r;
        if (insideArtboard == null) { insideArtboard = false; }
        let blocks = {"instances": [], "artboards": [], "texts": [], "ovals": [], "layouts": [], "images": []};

        // Hack: Put Figma overrides as blocks on top of the instance. This is how Figma overrides work but it
        // isn't how we do overrides in Pagedraw today. After experimenting with real Figma files this approach seems to produce the best results although the instance will be broken.
        // The right way to do this is to diff the Figma block tree between component and its instance and use the delta for the instance overrides in Pagedraw.
        if (node.children != null) {
            for (let child of Array.from(node.children)) {
                blocks = _l.assignWith(blocks, importNode(child, ['FRAME', 'COMPONENT'].includes(node.type)), (objVal, objSrc) => {
                    return objVal.concat(objSrc);
                });
            }
        }

        if (node.visible === false) { return blocks; }

        if (isImage(node)) {
            block = new EventualImageBlock(createBasicBlockAttrs(node));
            blocks["images"] = blocks["images"].concat(_l.extend(block, {id: node.id}));

        } else if ((node.type === "FRAME") && insideArtboard) {
            if (node.isMask) { return blocks; }
            blocks["layouts"] = blocks["layouts"].concat(createLayoutBlock(node));

        } else if (node.type === "ELLIPSE") {
            if (node.isMask) { return blocks; }
            blocks["ovals"] = blocks["ovals"].concat(new OvalBlock(createBasicBlockAttrs(node)));

        } else if (node.type === "INSTANCE") {
            blocks["instances"] = blocks["instances"].concat(new EventualInstanceBlock(_l.extend(createBasicBlockAttrs(node), {componentId: node.componentId})));

        } else if (node.type === "COMPONENT") {
            block = new ArtboardBlock(_l.extend(createBasicBlockAttrs(node), {outerBoxShadows: [], innerBoxShadows: []}));
            blocks["artboards"] = blocks["artboards"].concat(block);
            componentHash[node.id] = block;

        } else if (node.type === "FRAME") {
            block = new ArtboardBlock(_l.extend(createBasicBlockAttrs(node), {outerBoxShadows: [], innerBoxShadows: []}));
            ({r, g, b, a} = node.backgroundColor);
            set_dyn_attr(block, 'color', `rgba(${r*255},${g*255},${b*255},${a})`, node.id);
            blocks["artboards"] = blocks["artboards"].concat(block);

        } else if (node.type === "VECTOR") {
            if (node.isMask) { return blocks; }
            blocks["layouts"] = blocks["layouts"].concat(createLayoutBlock(node));

        } else if (node.type === "RECTANGLE") {
            if (node.isMask) { return blocks; }
            blocks["layouts"] = blocks["layouts"].concat(_l.extend(createLayoutBlock(node), {borderRadius: node.cornerRadius}));

        } else if (node.type === "TEXT") {
            const boundingBox = node.absoluteBoundingBox;
            const {
                style
            } = node;
            block = new TextBlock(_l.extend(createBasicBlockAttrs(node), {
                fontFamily: fontsByName[style.fontFamily] != null ? fontsByName[style.fontFamily] : new LocalUserFont({name: style.fontFamily}),
                isItalics: style.italic,
                textAlign: style.textAlignHorizontal,
                lineHeight: style.lineHeightPx,
                hasCustomFontWeight: true
            }
            )
            );

            set_dyn_attr(block, 'textContent', node.characters, node.id);
            set_dyn_attr(block, 'fontSize', style.fontSize, node.id);
            set_dyn_attr(block, 'fontWeight', style.fontWeight.toString(), node.id);
            set_dyn_attr(block, 'kerning', style.letterSpacing, node.id);

            if ((node.fills[0] != null ? node.fills[0].type : undefined) === "SOLID") {
                ({r, g, b, a} = node.fills[0].color);
                set_dyn_attr(block, 'fontColor', `rgba(${r*255},${g*255},${b*255},${a * (node.fills[0].opacity != null ? node.fills[0].opacity : 1)})`, node.id);
            }

            blocks["texts"] = blocks["texts"].concat(block);
        }

        return blocks;
    };

    const blocks = canvas.children.reduce(((acc, node) => {
        return _l.assignWith(importNode(node), acc, (objVal, objSrc) => objVal.concat(objSrc));
    }), []);

    if (_l.isEmpty(blocks)) { return []; }

    blocks['instances'] = _l.compact(blocks['instances'].map(instance => {
        if (!componentHash[instance.componentId]) { return null; }
        return new InstanceBlock({
            uniqueKey: instance.uniqueKey,
            sourceRef: componentHash[instance.componentId].componentSpec.componentRef,
            top: instance.top,
            left: instance.left,
            height: instance.height,
            width: instance.width
        });
    })
    );


    return _l.flatten(_l.values(blocks));
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}