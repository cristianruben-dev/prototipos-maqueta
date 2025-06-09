import { Header } from "./componentes/header";
import { Footer } from "./componentes/footer";
import { Section } from "./componentes/section";
import { Tanque } from "./componentes/tanque";

export default function App() {
  return (
    
    <>
      <Header/>
      

      <Section>
        <div className=" w-full h-[500px] relative">
          <div className="absolute top-4 left-4">
            <Tanque porcentaje={10} capacidad={200}/>
          </div>
          <div className="absolute top-4 right-4">
            <Tanque porcentaje={10} capacidad={100}/>
          </div>
          <div className="absolute bottom-4 right-4">
            <Tanque porcentaje={10} capacidad={100}/>
          </div>
        </div>
      </Section>
      <Footer/>
    </>
  )
}


