import React, { useEffect } from 'react'
import './App.css'
import Canvas from './canvas/Canvas'
import { useAppSelector } from './app/hooks'
import FinalModal from './components/FinalModal/FinalModal'

const App: React.FC<unknown> = () => {
  const score = useAppSelector(state => state.canvasReducer.score)

  return (
    <>
      <div className={'score'}>{score}</div>
      <FinalModal />
      <Canvas  />
    </>
  )
}

export default App
