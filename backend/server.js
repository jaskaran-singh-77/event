const express = require('express');
const mongoose = require('mongoose');
//import mongoose from 'mongoose';
const cors = require('cors');
require('dotenv').config();  



const app = express();
const port = process.env.PORT

app.use(cors())
 app.use(express.json());

 mongoose.connect(process.env.MONGODB_URI)

.then(()=>{

console.log("db conected")

})
 
.catch((err)=>{

console.log("cant conect to db",err)

     })

 
app.get('/', (req,res)=>{
res.send("servere is running  ")
})


const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 3 },
  venue: { type: String, required: true },
 date: { type: Date, required: true },
  totalSeats: { type: Number, required: true, min: 1, max: 500 },
  availableSeats: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }

})

const Event = mongoose.model('event', eventSchema)


const bookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'event', required: true },
  attendeeName: { type: String, required: true },
    email: { type: String, required: true },
  seats: { type: Number, required: true, min: 1, max: 5 },
  bookedAt: { type: Date, default: Date.now }
})
const Booking = mongoose.model('booking', bookingSchema)



app.post('/api/events', async (req,res)=>{
try{
  const { title, venue, date, totalSeats } = req.body

  if(!title || !venue || !date || !totalSeats){

    return res.status(400).json({ success: false, message: "add all value" })

  }

  if(title.length < 3){

    return res.status(400).json({ success: false, message: "at least 3 characters" })

  }

  if(totalSeats < 1 || totalSeats > 500){

    return res.status(400).json({ success: false,message: "total seats are form 1 to 500" })

  }

  const eventDate = new Date(date)
  if(eventDate < new Date()){

    return res.status(400).json({ success:false, message: "wtf how are u in the past " })

  }

  const newEvent = new Event({
    title,
     venue,
    date: eventDate,

    totalSeats,
    availableSeats: totalSeats
  })

  const savedEvent = await newEvent.save()




  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: {
      id: savedEvent._id,
      title: savedEvent.title,
      venue: savedEvent.venue,
      date: savedEvent.date,
      totalSeats: savedEvent.totalSeats,
      availableSeats: savedEvent.availableSeats
    }
  })

}catch(err){
  res.status(500).json({ success: false, message: "server error" })
}
})

app.get('/api/events', async (req,res)=>{
try{

  let events = await Event.find().sort({ date: 1 })

  if(req.query.search){
     const s = req.query.search.toLowerCase()
       events = events.filter(e => {
        return e.title.toLowerCase().includes(s) || e.venue.toLowerCase().includes(s)
    })
  }

  const data = events.map(e => {
    return {
       id: e._id,
      title: e.title,
venue: e.venue,
      date: e.date,
        totalSeats: e.totalSeats,
      availableSeats: e.availableSeats
    }
  })

  res.status(200).json({
    success: true,
     data: data
  }) 

}catch(err){
  console.log("error is:", err)
  res.status(500).json({ success: false, message: "somthing went wrng cant find events" })
}
})




app.post('/api/events/:id/book', async (req,res)=>{
try{

  const { attendeeName, email, seats } = req.body

  if(!attendeeName || !email || !seats){
     return res.status(400).json({ success: false, message: "pls fill all the filds" })
  }

  if(seats < 1 || seats > 5){
      return res.status(400).json({ success: false, message: "seats must be bw 1 to 5 only" })
  }

  const myevnt = await Event.findById(req.params.id)

  if(!myevnt){
    return res.status(404).json({ success: false, message: "Event not found" })
  }

  if(seats > myevnt.availableSeats){
     return res.status(400).json({ success: false, message: "Not enough seats available" })
  }

   myevnt.availableSeats = myevnt.availableSeats - seats
  await myevnt.save()

  const newBooking = new Booking({
      eventId: myevnt._id,
      attendeeName: attendeeName,
      email: email,
       seats: seats
  })

  await newBooking.save()

  res.status(201).json({
    success: true,
    message: "Booking confirmed",
    data: {
       bookingId: newBooking._id,
      eventId: myevnt._id,
       attendeeName: newBooking.attendeeName,
      seats: newBooking.seats,
      availableSeats: myevnt.availableSeats
    }
  })

}catch(err){
   res.status(500).json({ success: false, message: "somthing borken server err" })
}
})













































app.listen(port, ()=>{
console.log("serr is on this  port see ", port)
})