import React, { StrictMode,  useEffect,  useRef , useState} from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree} from "@react-three/fiber"
import { MeshToonMaterial, MathUtils } from 'three/src/Three.Core.js' 
import { OrbitControls, PerspectiveCamera, useGLTF} from "@react-three/drei"


const useScroll = () => {
    const [scrollData, setScrollData] = useState(0)

    useEffect(() => {
        
        const handleScroll = () => {
            const mainElement = document.querySelector('main')
            let currentScrollTop = mainElement.scrollTop
            setScrollData(currentScrollTop)
        }
        const mainElement = document.querySelector('main')
        mainElement.addEventListener('scroll', handleScroll)
        
        return () => {mainElement.removeEventListener('scroll', handleScroll)}
    }, [])

    return scrollData
}

function FieldOfStars(props){
  const addStar = () => {
    const [x, y, z] = Array(3).fill().map(() => MathUtils.randFloatSpread(props.range))
    return [x, y, z]
  }
  const stars = Array(200).fill().map(addStar)
  const starColors = ["#e50000", "#FFBF00", "#ffffff","#5f85ff" ]
  return (
    <>
    {stars.map((position, index) => {
     const randomColor = starColors[Math.floor(Math.random() * starColors.length)]
     return(
      <mesh key={index} position={position} >
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshToonMaterial color={randomColor} emissive={randomColor}  />
      </mesh>
    )
    })}
    </>
  )


}

function Box(props){
  const ref = useRef()
  let angleInDeg = 0

  useFrame((state, delta) => {
    
    angleInDeg += 1;
    ref.current.rotation.x = 4 * Math.cos((angleInDeg * Math.PI)/180);
    ref.current.rotation.y = 3 * Math.sin((angleInDeg * Math.PI)/180);
    ref.current.rotation.z = 2 * Math.cos((angleInDeg * Math.PI)/180);
  })

  return (
  <mesh position={props.position} ref={ref}>
    <boxGeometry args={[2,2,2]}/>
    <meshToonMaterial 
    color={props.color}
    
    />
  </mesh>
  )
}

function ToonTourus(props){

  const ref = useRef()
  let angleInDeg = 0

  useFrame((state, delta) => {
    
    angleInDeg += delta ;
    ref.current.rotation.x = angleInDeg;
  })


  return (
  <mesh ref={ref}>
    <torusGeometry args={[3.5, 0.5]} />
    <meshToonMaterial color="magenta"/>
  </mesh>
  )
}

function Monkey(props){
  const { scene } = useGLTF("/models/monkey.glb")
  const ref = useRef()

  scene.rotateY(13 * Math.PI / 180)
  let angle = 0  
  useFrame((state, delta) => {
    angle += delta
    ref.current.rotation.z = Math.sin(angle)
  })

  useEffect (() => {
    scene.traverse((child) => {
      if (child.isMesh){
        const original = child.material.color.clone()
        
        child.material = new MeshToonMaterial({color: original})
      }
    })
  }, [scene])


  return (
    <>
    <primitive object={scene} ref={ref} position={props.position}/>
    <pointLight position={props.position} />
    </>
  )
}

function Donut(props){
  const { scene } = useGLTF("/models/donut_alone_2.glb")
  const ref = useRef()
  scene.scale.set(...Array(3).fill(props.scale))

  useEffect (() => {
    scene.traverse((child) => {
      if (child.isMesh){
        const original = child.material.color.clone()
        
        child.material = new MeshToonMaterial({color: original, emissive: original})
      }
    })
  }, [scene])

  let angle = 0
  useFrame((state, delta) => {
    angle = delta * 0.2
    ref.current.rotateY(angle)
  })

  return (
    <primitive object={scene} ref={ref} position={props.position}
    rotation={props.rotation}/>
  )
}

function CustomCamera(){
  const { camera } = useThree()
  const scrollPos = useScroll()
  const [initial, scrollScale, scrollLimit] = [6.1, 0.035, 65]

  useEffect(() => {
    const newZ = initial + (scrollPos * scrollScale)
    const clampedZ = Math.min(Math.max(initial, newZ), scrollLimit)

    camera.position.setZ(clampedZ)

    const handler = () => {
      console.log(camera.position)
    }
    document.body.addEventListener('contextmenu', handler)
    return () => {document.body.removeEventListener('contextmenu', handler)}

  }, [scrollPos, camera])
  // x: 3.130954479298693, y: 4.102344359629457, z: 6.177288567264989 
  return (<PerspectiveCamera makeDefault position={[3.1, 4.1, 6.1]}/>)
}


function Scene() {

  return(
    <StrictMode>
      <Canvas>
        <color attach="background" args={["#000000"]}/>
        {/* Camera */}
        {/* <PerspectiveCamera makeDefault position={[3.1, 4.1, 6.1]}/> */}
        <CustomCamera  />
        {/* Meshes */}
        <Box  color="#00ff65"/>
        <ToonTourus  />
        <Monkey position={[-2 ,2, 30]} />
        <Donut position={[5, 4, 50]} scale={15} rotation={[0.5, 0, 0.3]} />

        {/* Stars */}
        <FieldOfStars range={100} />

        {/* Lights */}
        <pointLight color="#FFA500" position={[1.5, 1.5, 0]} decay={3} intensity={10} />
        <pointLight color="#fa00ff" position={[-1.5, -1.5, 0]} decay={3} intensity={10} />
        <pointLight color="#efff00" position={[-1.5, 1.5, 0]} decay={3} intensity={10} />
        <pointLight color="#ff009a" position={[1.5, -1.5, 0]} decay={3} intensity={10} />

        {/* Controls */}
        <OrbitControls />
      </Canvas>
    </StrictMode>
    )
}


createRoot(document.getElementById('root')).render(Scene())