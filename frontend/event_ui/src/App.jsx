import { useState, useEffect } from 'react'
import axios from 'axios'


function EventCard({ e1, onBookOk }) {

   const [name, setName] = useState('')
   const [email, setEmail] = useState('')
    const [seats, setSeats] = useState(1)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const handleBook = async (e) => {
    e.preventDefault()
    setMsg('')
      setErr('')

    try{
      const res = await axios.post('http://localhost:5000/api/events/' + e1.id + '/book', {
        attendeeName: name,
          email: email,
        seats: Number(seats)
      })

      setMsg("ticket booked succesfully !")
      setName('')
      
      setEmail('')
      setSeats(1)
      onBookOk(e1.id, res.data.data.availableSeats)

    }catch(error){
      if(error.response && error.response.data && error.response.data.message){
        setErr(error.response.data.message)
      }else{
        setErr("somthing went wrng in bokking")
      }
    }
  }

  return (
    <div style={{ border: '1px solid black', padding: '10px', margin: '15px 0' }}>
      <h3>{e1.title}</h3>
      <p>venue: {e1.venue}</p>
      <p>date: {e1.date}</p>
      <p>seats left: <b>{e1.availableSeats}</b></p>

      {e1.availableSeats === 0 ? (
        <p style={{ color: 'red', fontWeight: 'bold' }}>SOLD OUT</p>
      ) : (
        <form onSubmit={handleBook}>
          <h4>book tickts</h4>

          <div>
             <label>ur name: </label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} />
          </div>

          <div style={{ marginTop: '5px' }}>
            <label>ur email: </label>
            <input type="text" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          <div style={{ marginTop: '5px' }}>
            <label>seats (1-5): </label>
            <input type="number" min="1" max="5" value={seats} onChange={e=>setSeats(e.target.value)} />
          </div>

          <button type="submit" style={{ marginTop: '8px' }}>Book</button>
        </form>
      )}

      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {err && <p style={{ color: 'red' }}>{err}</p>}
    </div>
  )
}




function App() {

  const [evnts, setEvnts] = useState([])
  const [lodig, setLodig] = useState(false)
  const [errrr, setErrrr] = useState('')

  const [srch, setSrch] = useState('')

  const [titel, setTitel] = useState('')
  const [venu, setVenu] = useState('')
  const [dte, setDte] = useState('')
  const [totalseats, setTotalSeats] = useState('')

  const [okmsg, setOkmsg] = useState('')
  const [adderror, setAddError] = useState('')


  const getEvnts = async (txt = '') => {
    setLodig(true)
    setErrrr('')

    try{
      let url = 'http://localhost:5000/api/events'
      if(txt){
        url = url + '?search=' + txt
      }

      const res = await axios.get(url)
      setEvnts(res.data.data)
      setLodig(false)

    }catch(err){
      setErrrr("cant load evnts from backend")
      setLodig(false)
    }
  }


  useEffect(() => {
    getEvnts()
  }, [])


  const doSearch = (e) => {
    e.preventDefault()
    getEvnts(srch)
  }

  const clearSrch = () => {
    setSrch('')
    getEvnts('')
  }


  const handleAdd = async (e) => {
    e.preventDefault()
    setOkmsg('')
    setAddError('')

    try{
      const res = await axios.post('http://localhost:5000/api/events', {
        title: titel,
        venue: venu,
        date: dte,
        totalSeats: Number(totalseats)
      })

      setOkmsg("evnt added !")
      setEvnts([res.data.data, ...evnts])

      setTitel('')
      setVenu('')
      setDte('')
      setTotalSeats('')

    }catch(err){
      if(err.response && err.response.data && err.response.data.message){
        setAddError(err.response.data.message)
      }else{
        setAddError("faild to add evnt")
      }
    }
  }


  const onBookOk = (eventId, newLeftSeats) => {
    const updated = evnts.map(x => {
      if(x.id === eventId){
        return { ...x, availableSeats: newLeftSeats }
      }
      return x
    })
    setEvnts(updated)
  }


  return (
    <div style={{ maxWidth: '550px', margin: '20px auto', fontFamily: 'sans-serif' }}>

      <h2>Evnt Boking App</h2>


      <div style={{ border: '1px solid black', padding: '10px' }}>
        <h3>Add New Evnt</h3>

        <form onSubmit={handleAdd}>
          <div>
            <label>titel: </label>
            <input type="text" value={titel} onChange={e=>setTitel(e.target.value)} />
          </div>

          <div style={{ marginTop: '5px' }}>
            <label>venue: </label>
            <input type="text" value={venu} onChange={e=>setVenu(e.target.value)} />
          </div>

          <div style={{ marginTop: '5px' }}>
             <label>date: </label>
            <input type="date" value={dte} onChange={e=>setDte(e.target.value)} />
          </div>

          <div style={{ marginTop: '5px' }}>
            <label>totl seats: </label>
             <input type="number" value={totalseats} onChange={e=>setTotalSeats(e.target.value)} />
          </div>

          <button type="submit" style={{ marginTop: '10px' }}>Create evnt</button>
        </form>

        {okmsg && <p style={{ color: 'green' }}>{okmsg}</p>}
        {adderror && <p style={{ color: 'red' }}>{adderror}</p>}
      </div>



      <div style={{ border: '1px solid black', padding: '10px', marginTop: '15px' }}>
        <h3>srch evnts</h3>

        <form onSubmit={doSearch}>
          <input
            type="text"
            placeholder="srch title or venue"
            value={srch}
            onChange={e=>setSrch(e.target.value)}
          />

          <button type="submit" style={{ marginLeft: '5px' }}>srch</button>
          <button type="button" onClick={clearSrch} style={{ marginLeft: '5px' }}>clear</button>
        </form>
      </div>



      <h3>evnt list</h3>

      {lodig && <p>lodign evnts...</p>}
      {errrr && <p style={{ color: 'red' }}>{errrr}</p>}

      {!lodig && evnts.length === 0 && (
        <p>no evnts found</p>
      )}

      {evnts.map(e1 => (
        <EventCard
          key={e1.id}
          e1={e1}
          onBookOk={onBookOk}
        />
      ))}

    </div>
  )
}

export default App
