require('dotenv').config();
const app = require('./app');
const userRoutes = require('./routes/user.routes');
const PORT = 3000;

app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});