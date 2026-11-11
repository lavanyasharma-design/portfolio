import Home from './pages/Home'
import Work from './pages/Work'

// no router yet: /work is the only other page
function App() {
  return location.pathname.replace(/\/$/, '') === '/work' ? <Work /> : <Home />
}

export default App
