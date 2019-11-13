import React from 'react';
import {useSelector} from "../redux/store";
import {LoginOrCreateForm} from "./LoginOrCreateForm";

const App: React.FC = () => {
  const id = useSelector(state => state.auth.id);
  console.log("OUI", id);
  if (id === null) {
    return <LoginOrCreateForm/>
  }
  return (
    <div>
      Yup.
    </div>
  );
};

export default App;
