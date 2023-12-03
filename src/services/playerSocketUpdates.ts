import { io } from 'socket.io-client'

console.log('init socket...')

// TODO: add typescript types
const socket = io.connect(
    'http://localhost:8000/event?event_id=your-guid-here')

socket.on("connect", () => {
    console.log('connect', socket.connected); // true
});

socket.on("disconnect", () => {
    console.log('disconnect', socket.connected); // false
});

socket.on("connect_error", (error: any) => {
    console.log("connect_error", error);
});

socket.on("remoteValue", (data: any) => {
    console.log('remoteValue', data)
})
