import {Router} from "express";
import {crearorden, feedback, notificacionorden} from "../controller/mercaControllers.js";

const router = Router();

router.post('/crear-orden', crearorden)
router.post('/notificacion', notificacionorden)
router.get('/feedback', feedback)

export default router;