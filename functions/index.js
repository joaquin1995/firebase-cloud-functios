const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.historialatrasos = functions.firestore.document('/cobros/{cobrosId}').onUpdate(async (change, context) => {
    console.log('entro a historialatrasos');
    // console.log(snap);
    const cobrosId = context.params.cobrosId;
    console.log(cobrosId);
    const newValue = change.after.data();
    const key = Object.keys(newValue)[0];
    console.log(newValue[key].monto);
    const oldValue = change.before.data();
    const nuevoMonto = newValue[key].monto;
    const montoAnterior = oldValue[key].monto;
    const monto = Number(nuevoMonto) + montoAnterior;
    const cuota = newValue[key].cuota;
    const fecha = newValue[key].fecha;
    console.log(admin.firestore.Timestamp.now());
    const fbFecha = admin.firestore.Timestamp.now();
    const date = new Date(fbFecha.seconds * 1000);
    console.log(date);
    let fechaSistema = date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + String(date.getDate()).padStart(2, '0');
    // let horaSistema = date.toLocaleTimeString();
    // console.log(horaSistema);
    let json = {
        [key]: {
            monto: nuevoMonto,
            cuota: cuota,
            id: cobrosId,
            fechaPago: fecha,
            // fechaActual: fechaSistema,
            // horaActual: horaSistema,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
    };

    await firestore
        .collection(`historial-pagos`)
        .doc()
        .set({ ...json });

    if (Number(monto) < Number(cuota) && fecha < fechaSistema) {
        console.log('historial-atrasos');
        const res = await firestore
            .collection(`historial-atrasos`)
            .doc()
            .set({ ...json });
        return res;
    }
    if (Number(monto) === Number(cuota) && fecha === fechaSistema) {
        console.log('historial-ingresos');

        const res = await firestore
            .collection(`historial-ingresos`)
            .doc()
            .set({ ...json });
        return res;
    }
    if (Number(monto) === Number(cuota) && fecha > fechaSistema) {
        console.log('historial-adelantos');
        const res = await firestore
            .collection(`historial-adelantos`)
            .doc()
            .set({ ...json });
        return res;
    }

});