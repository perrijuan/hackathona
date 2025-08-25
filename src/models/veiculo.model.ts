export interface Veiculo {
  id?: string;
  idUsuario: string;
  nome: string;
  marca: string;
  modelo: string;
  placa: string;
  tipo: "carro" | "moto" | "van" | "outro";
  consumoMedio: number; // Em km/l
}
