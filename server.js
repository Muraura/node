const app = require('./src/app');

const port = process.env.PORT || 5003;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
