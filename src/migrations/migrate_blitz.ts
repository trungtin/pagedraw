// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let address_for_blitz_id, copy_blitz, delete_blitz, get_all_blitz_addresses, read_blitz, transaction_blitz, write_blitz;
import _l from 'lodash';
import AWS from 'aws-sdk';

AWS.config.update({ accessKeyId: process.env['AWS_ACCESS_KEY_ID'], secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] });
const s3 = new AWS.S3();

const S3_LIST_MAX_KEYS = 10;
var list_all_objects_in_bucket = function(bucket, continuation_token) { if (continuation_token == null) { continuation_token = undefined; } return new Promise((resolve, reject) => s3.listObjectsV2({
    Bucket: bucket,
    MaxKeys: S3_LIST_MAX_KEYS,
    ContinuationToken: continuation_token
}, function(err, data) {
    if (err) { return reject(err); }
    return (
        data.NextContinuationToken
        ? list_all_objects_in_bucket(bucket, data.NextContinuationToken)
        : Promise.resolve([])
    ).then(rest_of_the_list => resolve(data.Contents.concat(rest_of_the_list)));
})); };

//#

const BLITZ_BUCKET = 'pagedraw-blitzes';
const list_all_blizes = () => list_all_objects_in_bucket(BLITZ_BUCKET).then(s3_object_list => _l.map(s3_object_list, 'Key'));

const defaultExport = {};

defaultExport.read_blitz = (read_blitz = blitz_id => s3.getObject({Bucket: BLITZ_BUCKET, Key: blitz_id}).promise().then(({Body}) => JSON.parse(Body.toString('utf-8'))));

defaultExport.write_blitz = (write_blitz = (blitz_id, pkg) => Promise.resolve().then(() => s3.putObject({
    Bucket: BLITZ_BUCKET,
    Key: blitz_id,
    Body: JSON.stringify(pkg)
}).promise()));

defaultExport.delete_blitz = (delete_blitz = blitz_id => s3.deleteObject({Bucket: BLITZ_BUCKET, Key: blitz_id}).promise());


defaultExport.copy_blitz = (copy_blitz = (from_id, to_id) => read_blitz(from_id).then(pkg => write_blitz(to_id, pkg)));

//#

defaultExport.address_for_blitz_id = (address_for_blitz_id = blitz_id => ({
    ty: 'blitz',
    blitz_id
}));

defaultExport.get_all_blitz_addresses = (get_all_blitz_addresses = () => list_all_blizes().then(blitz_ids => blitz_ids.map(address_for_blitz_id)));

// we take in ABORT_TRANSACTION as an input because we can't exactly import it right now
defaultExport.blitz_transaction = (transaction_blitz = (ABORT_TRANSACTION, addr, mapDocjson) => Promise.resolve().then(function() {
    const {blitz_id} = addr;

    return read_blitz(blitz_id).then(pkg => Promise.resolve(mapDocjson(pkg.pagedraw, addr)).then(function(mappedJson) {
        if (mappedJson === ABORT_TRANSACTION) {
            return null;

        } else {
            return write_blitz(blitz_id, _l.extend({}, pkg, {pagedraw: mappedJson}));
        }
    }));
}));

//###

// THINK: what about s3 backup ??
// THINK: what about blitz staging?
export default defaultExport;
