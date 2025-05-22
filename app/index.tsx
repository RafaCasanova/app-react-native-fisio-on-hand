import { router, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Home = () => {
  const router = useRouter();
  
  const frases = [
    "Organize sua rotina, atenda com excelência.",
    "Sua clínica na palma da mão.",
    "Gestão completa para fisioterapeutas modernos.",
    "Mais tempo para cuidar, menos tempo com papelada.",
    "Controle total da sua agenda, pacientes e finanças.",
    "Porque sua carreira merece organização profissional.",
    "Foco no paciente. A gente cuida do resto.",
    "Otimize seu dia, melhore seus resultados.",
    "Seu consultório digital começa aqui.",
    "Tecnologia pensada para fisioterapeutas."
  ];

  const [textoAtual, setTextoAtual] = useState("");

  const [indiceFrase, setIndiceFrase] = useState(0);

  const charIndexRef = useRef(0);
  const isTypingRef = useRef(true);


  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    const fraseCompleta = frases[indiceFrase];

    const step = () => {
      if (isTypingRef.current) {
        if (charIndexRef.current < fraseCompleta.length) {
          charIndexRef.current += 1;
          setTextoAtual(fraseCompleta.slice(0, charIndexRef.current));
          clearExistingTimeout();
          timeoutRef.current = setTimeout(step, 100); 
        } else {
          clearExistingTimeout();
          timeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            step(); 
          }, 2000);
        }

      } else {
        if (charIndexRef.current > 0) {
          charIndexRef.current -= 1;
          setTextoAtual(fraseCompleta.slice(0, charIndexRef.current));
          clearExistingTimeout();
          timeoutRef.current = setTimeout(step, 50); 
        } else {
          clearExistingTimeout();
          isTypingRef.current = true;
          setIndiceFrase(prev => (prev + 1) % frases.length);
        }
      }
    };


    step();


    return () => {
      clearExistingTimeout();
    };
  }, [indiceFrase]); 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem vindo ao fisio on hand!</Text>
      <Text style={styles.subtitle}>{textoAtual}</Text>
      <TouchableOpacity onPress={() => router.push("/login")} 
        style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    minHeight: 50, 
  },
  button: {
    width: '80%',
    padding: 14,
    backgroundColor: '#2ecc71',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default Home;
