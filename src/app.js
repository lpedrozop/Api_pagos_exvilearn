import express from "express";
import morgan from "morgan";
import MercadoRouter from "./routes/MercadopagoRouter.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json())
app.use(morgan('dev'));
app.use(MercadoRouter)

app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint Not Found'
    })
})

export default app;

