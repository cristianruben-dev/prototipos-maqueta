import { Header } from "./componentes/header";
import { Footer } from "./componentes/footer";
import { Section } from "./componentes/section";
import { Tanque } from "./componentes/tanque";
import { useState, useEffect } from "react";
import { useMQTT } from "./hook/useMQTT";

export default function App() {
  const [tanqueprincipal, setTanqueprincipal] = useState({litros: 0, presion: 0});
  const [tanque1, setTanque1] = useState({litros: 0, presion: 0});
  const [tanque2, setTanque2] = useState({litros: 0, presion: 0});
  const {data,connected} = useMQTT("ws://localhost:9001", "tanques/datos");

  useEffect(() => {
    const datos = JSON.parse(data);
    console.log(datos);
    if(connected){
        setTanqueprincipal({litros: datos.tanque1.litros, presion: datos.tanque1.presion});
        setTanque1({litros: datos.tanque2.litros, presion: datos.tanque2.presion});
        setTanque2({litros: datos.tanque3.litros, presion: datos.tanque3.presion});
    }
  },[data])
  return (
    
    <>
      <Header/>
      

      <Section>
        <div className=" w-full h-[500px] relative">
          <div className="absolute top-4 left-4">
            <Tanque porcentaje={tanqueprincipal.litros*100/200} capacidad={200}/>
          </div>
          <div className="absolute top-4 right-4">
            <Tanque porcentaje={tanque1.litros*100/100} capacidad={100}/>
          </div>
          <div className="absolute bottom-4 right-4">
            <Tanque porcentaje={tanque2.litros*100/100} capacidad={100}/>
          </div>
        </div>
      </Section>
      <Footer/>
    </>
  )
}


