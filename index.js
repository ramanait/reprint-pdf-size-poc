const http = require('http');
// Imports the Google Cloud client library
const { Storage } = require('@google-cloud/storage');

// Creates a client using Application Default Credentials
// const storage = new Storage();
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {

    // const Storage = require('@google-cloud/storage');
    const projectId = "gicc-356813";
    const bucketName = "sridhar-reprint";
    const storage = new Storage({
        projectId: projectId,
        keyFilename: 'gicc-356813-6b616374d8ae.json'
    });
    const options = {
        prefix: "pdf/"
    }
    let pdfsBySize = {formart1:[],formart2:{small:[],medium:[],large:[]}};
    storage
        .bucket(bucketName)
        .getFiles(options)
        .then(results => {
            const files = results[0];
            files.forEach(file => {
                storage.
                    bucket(bucketName)
                    .file(file.name)
                    .getMetadata()
                    .then(metadata_results => {
                        const metadata = metadata_results[0];
                        console.log(metadata.size);
                        console.log(metadata.name);
                        if (metadata.size < 100000) {
                            pdfsBySize.formart1.push({ type: 'small', name: metadata.name, size: metadata.size })
                            pdfsBySize.formart2.small.push({ name: metadata.name, size: metadata.size })
                        }
                        else if (metadata.size > 100000 && metadata.size < 10000000) {
                            pdfsBySize.formart1.push({ type: 'medium', name: metadata.name, size: metadata.size })
                            pdfsBySize.formart2.medium.push({ name: metadata.name, size: metadata.size })
                        }
                        else {
                            pdfsBySize.formart1.push({ type: 'large', name: metadata.name, size: metadata.size })
                            pdfsBySize.formart2.large.push({ name: metadata.name, size: metadata.size })
                        }
                    }).catch(metadata_err => {
                        console.error(metadata_err);
                    });
            });
        }).catch(err => {
            console.error(err);
        });
    setTimeout(() => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(JSON.stringify(pdfsBySize));
    }, 5000);


});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});