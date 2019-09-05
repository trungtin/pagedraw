#!/usr/bin/env nodeimport fs from 'fs';
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import request from 'request';
import StreamObject from 'stream-json/utils/StreamObject';
import ProgressBar from 'progress';

// call with something like
// cjsx src/migrations/upload_to_firebase.coffee "https://pagedraw-1226.firebaseio.com/pages" < docset.json
//
// To restore from backup do
// jq '.pages' full-backup.json > pages.json
// cjsx src/migrations/upload_to_firebase.coffee "https://pagedraw.firebaseio.com/pages" < pages.json
const root = process.argv[2];

const parser = StreamObject.make();
const inputStream = fs.createReadStream('/dev/stdin');
inputStream.pipe(parser.input);

const n_docs = 6000; // this is just wrong
const errors = [];
const bar = new ProgressBar('[:bar] :rate docs/sec :percent done :etas remain', {
    total: n_docs,
    width: 50
});

let done = 0;
parser.output.on('data', ({key, value}) => {
    var retry = () => request.put({url: `${root}/${key}.json`, body: value, json: true}, function(err) {
        if (err) {
            console.error(`Error on ${key}`);
            console.error(err);
            console.error(`Retrying ${key}...`);
            errors.push(err);
            return retry();
        }

        done += 1;
        if (done < n_docs) { return bar.tick(); }
    });
    return retry();
});

parser.output.on('finish', () => {
    console.log("Finished reading everything from stdin");
    return console.log(`Total of ${errors.length} errors`);
});

