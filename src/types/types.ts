export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined; 
  ToolDetail: { toolId: number };
  CreateTool: undefined;
  LocationScreen: undefined;}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

import { z } from 'zod';

export const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório"),
  email: z.string().email("Email inválido").nonempty("O campo email é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").nonempty("O campo senha é obrigatório"),
  phone: z.string().nonempty("O campo telefone é obrigatório"),
  cpf: z.string().nonempty("O campo CPF é obrigatório"),
  type: z.string().nonempty("O campo tipo é obrigatório"),
  address: z.string().nonempty("O campo endereço é obrigatório"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  image: z.string().optional(),
});

export type FormData = z.infer<typeof schema>;