const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const firestore = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.historialatrasos = functions.firestore
    .document("/cobros/{cobrosId}")
    .onUpdate(async (change, context) => {
        console.log("entro a historialatrasos");
        // console.log(snap);
        const cobrosId = context.params.cobrosId;
        console.log(cobrosId);
        const newValue = Object.keys(change.after.data()).map((key) => {
            return { ...change.after.data()[key], key };
        });
        const oldValue = Object.keys(change.before.data()).map((key) => {
            return { ...change.before.data()[key], key };
        });
        console.log(newValue, oldValue);
        // const res = oldValue.filter(
        //     ({ monto: monto1 }) =>
        //         !newValue.some(({ monto: monto2 }) => monto2 === monto1)
        // );
        const res = newValue.filter(function(obj) {
            return !oldValue.some(function(obj2) {
                if(obj.key === obj2.key){
                    console.log(obj.key, obj2.key);
                    console.log(obj.monto, obj2.monto);
                    return obj.monto === obj2.monto;
                }
            });
        });
        console.log(res);
        if (res.length > 0) {
            for (let i = 0; i < res.length; i++) {
                const x = res[i];
                // { cuota: 50, fecha: '2022/2/9', monto: 15, key: '2' }
                const nuevoMonto = x.monto;
                console.log("nuevoMonto", nuevoMonto);
                const montoAnterior = obtenerMontoAntiguo(x.key);
                console.log("montoAnterior", montoAnterior);
                const monto = Number(nuevoMonto) + montoAnterior;
                console.log("monto", monto);
                const cuota = x.cuota;
                console.log("cuota", cuota);
                const fecha = x.fecha;
                console.log("fecha", fecha);
                // console.log(monto, cuota, fecha, nuevoMonto, montoAnterior);

                let json = {
                    [x.key]: {
                        monto: nuevoMonto,
                        cuota: cuota,
                        id: cobrosId,
                        fechaPago: fecha,
                        key: x.key,
                        // fechaActual: fechaSistema,
                        // horaActual: horaSistema,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    },
                };

                await firestore
                    .collection(`historial-pagos`)
                    .doc()
                    .set({ ...json });
            }
        }

        function obtenerMontoAntiguo(key) {
            for (let i = 0; i < oldValue.length; i++) {
                const x = oldValue[i];
                if (key === x.key) {
                    return x.monto;
                }
            }
            return null;
        }

        function comparacionArrays(){
            newValue.filter(function(obj) {
                return !oldValue.some(function(obj2) {
                    console.log(obj.monto == obj2.monto);
                    return obj.monto == obj2.monto;
                });
            });
        }

        // const newValue = change.after.data();
        // const key = Object.keys(newValue)[0];
        // console.log('key=========================', key);
        // console.log(' change.after.data()=========================',  change.after.data());
        // console.log('change.before.data()=========================', change.before.data());

        // const results = change.after.data().filter(({ value: id1 }) => !change.before.data().some(({ value: id2 }) => id2 === id1));

        // console.log('results===========>>>>>',results);

        // console.log(newValue[key].monto);
        // const oldValue = change.before.data();
        // const nuevoMonto = newValue[key].monto;
        // const montoAnterior = oldValue[key].monto;
        // const monto = Number(nuevoMonto) + montoAnterior;
        // const cuota = newValue[key].cuota;
        // const fecha = newValue[key].fecha;
        // console.log(admin.firestore.Timestamp.now());
        // const fbFecha = admin.firestore.Timestamp.now();
        // const date = new Date(fbFecha.seconds * 1000);
        // console.log(date);
        // let fechaSistema = date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + String(date.getDate()).padStart(2, '0');
        // // let horaSistema = date.toLocaleTimeString();
        // // console.log(horaSistema);
        // let json = {
        //     [key]: {
        //         monto: nuevoMonto,
        //         cuota: cuota,
        //         id: cobrosId,
        //         fechaPago: fecha,
        //         // fechaActual: fechaSistema,
        //         // horaActual: horaSistema,
        //         createdAt: admin.firestore.FieldValue.serverTimestamp()
        //     }
        // };

        // await firestore
        //     .collection(`historial-pagos`)
        //     .doc()
        //     .set({ ...json });

        // if (Number(monto) < Number(cuota) && fecha < fechaSistema) {
        //     console.log('historial-atrasos');
        //     const res = await firestore
        //         .collection(`historial-atrasos`)
        //         .doc()
        //         .set({ ...json });
        //     return res;
        // }
        // if (Number(monto) === Number(cuota) && fecha === fechaSistema) {
        //     console.log('historial-ingresos');

        //     const res = await firestore
        //         .collection(`historial-ingresos`)
        //         .doc()
        //         .set({ ...json });
        //     return res;
        // }
        // if (Number(monto) === Number(cuota) && fecha > fechaSistema) {
        //     console.log('historial-adelantos');
        //     const res = await firestore
        //         .collection(`historial-adelantos`)
        //         .doc()
        //         .set({ ...json });
        //     return res;
        // }
    });
