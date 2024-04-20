const express = require('express');
const ratelimiter = require('express-rate-limit');
const tesseract = require('tesseract.js');

const createWorker = tesseract.createWorker;
const rateLimit = ratelimiter.rateLimit;
const app = express();

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 100
})

app.use(limiter);
app.use(express.raw({limit: '20mb', type:"image/*"}));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("working and listening on: ", PORT);
});

app.get("/", (req, res) => {
    res.send({"status": true})
});

app.post('/recognize', (req, res) => {
    if (req.is('image/*')){
        (async () => {
            
            const worker = await createWorker(req.query.lang !== "AUTO" ? [req.query.lang.toLowerCase()] : ['eng', 'rus', 'ara', 'spa', 'chi_tra', 'chi_sim', 'por', 'fra', 'hin', 'ukr','jpn', 'kor'], 1);
            try {
                const { data: { text } } = await worker.recognize(req.body);
                res.send({ "result": text });
            } catch (error) {
                res.sendStatus(500);
            }
            await worker.terminate();
        })();
    } else {
        res.sendStatus(400)
    }
});