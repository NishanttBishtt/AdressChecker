import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Checker from './checker'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Checker />
    </>
  )
}

export default App
