import React from 'react';
import {useSelector} from "../redux/store";
import {LoginOrCreateForm} from "./LoginOrCreateForm";
import {ChatBox} from "./ChatBox";

const App: React.FC = () => {
  const id = useSelector(state => state.auth.id);
  console.log("OUI", id);
  if (id === null) {
    return <LoginOrCreateForm/>
  }
  return <ChatBox/>
};

export default App;
