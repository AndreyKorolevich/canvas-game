import React from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import styles from './FinalModal.module.scss'
import { actionsCanvas } from '../../actions/canvasAction'

const FinalModal: React.FC<unknown> = (props) => {
  const dispatch = useAppDispatch()
  const score = useAppSelector(state => state.canvasReducer.score)
  const isShowModal = useAppSelector(state => state.canvasReducer.isShowFinalModal)

  const startNewGame = () => {
    dispatch(actionsCanvas.startNewGameAC())
    dispatch(actionsCanvas.increaseGameNumberAC())
  }

  return (
    <>{isShowModal &&
      <dialog className={styles.dialog} open={isShowModal}>
        <header>
          <h3 className={styles.title}>{'Game over'}</h3>
        </header>
        <main>
          <div className={styles.message}>{'Your score is: '} <span className={styles.score}>{score}</span></div>
        </main>
        <footer className={styles.footer}>
          <button onClick={startNewGame} className={styles.button}>{'Start new game'}</button>
        </footer>
      </dialog>
    }</>
  )
}

export default FinalModal
