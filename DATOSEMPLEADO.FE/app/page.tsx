"use client";

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PlusCircle, ChevronDown, ChevronRight, AlertTriangle, UserPlus, Users, FileText, Pencil, CheckCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import axios from "axios";

const API_URL = "http://localhost:3000";


const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  direccion: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  edad: z.coerce.number().int().min(18, { message: "La edad debe ser mayor o igual a 18" }),
  profesion: z.string().min(2, { message: "La profesión debe tener al menos 2 caracteres" }),
  estadoCivil: z.string().min(1, { message: "Debe seleccionar un estado civil" }),
})

type Colaborador = z.infer<typeof formSchema> & { id?: number }

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [riesgoInfo, setRiesgoInfo] = useState<{ mensaje: string; tipo: "success" | "warning" | "error" } | null>(null)
  const [formCollapsed, setFormCollapsed] = useState(false)
  const [tableCollapsed, setTableCollapsed] = useState(false)
  const [editandoColaborador, setEditandoColaborador] = useState<Colaborador | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [colaboradorAEliminar, setColaboradorAEliminar] = useState<number | null>(null)
  const { toast } = useToast()

  const form = useForm<Colaborador>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      direccion: "",
      edad: 0,
      profesion: "",
      estadoCivil: "",
    },
  })

  const cargarColaboradores = async () => {
    setLoading(true);
    try {
      const respuesta = await axios.get(`${API_URL}/colaborador`);
      console.log("Datos recibidos:", respuesta.data); 
  
      // Normalizar nombres de propiedades
      const colaboradoresNormalizados = respuesta.data.map((colaborador: any) => ({
        id: colaborador.IDCOLABORADOR,
        nombre: colaborador.NOMBRE,
        apellido: colaborador.APELLIDO,
        direccion: colaborador.DIRECCION,
        edad: colaborador.EDAD,
        profesion: colaborador.PROFESION,
        estadoCivil: colaborador.ESTADOCIVIL,
      }));
  
      console.log("Datos normalizados:", colaboradoresNormalizados);
      setColaboradores(colaboradoresNormalizados);
  
      toast({
        title: "Colaboradores cargados",
        description: "Los colaboradores se han cargado correctamente",
      });
    } catch (error) {
      console.error("Error al cargar colaboradores:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los colaboradores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarColaborador = async (data: Colaborador) => {
    setLoading(true)
    try {
      const colaboradorData = {
        NOMBRE: data.nombre,
        APELLIDO: data.apellido,
        DIRECCION: data.direccion,
        EDAD: data.edad,
        PROFESION: data.profesion,
        ESTADOCIVIL: data.estadoCivil,
      };

      const respuesta = await axios.post(`${API_URL}/colaborador`, colaboradorData);
      console.log("Colaborador agregado:", respuesta);

      const nuevoColaborador = {
        id: respuesta.data.IDCOLABORADOR,
        nombre: respuesta.data.NOMBRE,
        apellido: respuesta.data.APELLIDO,
        direccion: respuesta.data.DIRECCION,
        edad: respuesta.data.EDAD,
        profesion: respuesta.data.PROFESION,
        estadoCivil: respuesta.data.ESTADOCIVIL,
      };

      setColaboradores([...colaboradores, nuevoColaborador]);
      // Se resetea el formulario a valores vacíos
      form.reset({
        nombre: "",
        apellido: "",
        direccion: "",
        edad: 0,
        profesion: "",
        estadoCivil: ""
      });
      setEditandoColaborador(null);
      toast({
        title: "Colaborador agregado",
        description: "El colaborador se ha agregado correctamente",
      });
    } catch (error) {
      console.error("Error al agregar colaborador:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el colaborador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const editarColaborador = (colaborador: Colaborador) => {
    setEditandoColaborador(colaborador);
    form.reset({ ...colaborador });
    setFormCollapsed(false);
  }

  const actualizarColaborador = async (data: Colaborador) => {
    setLoading(true)
    try {
      const colaboradorData = {
        NOMBRE: data.nombre,
        APELLIDO: data.apellido,
        DIRECCION: data.direccion,
        EDAD: data.edad,
        PROFESION: data.profesion,
        ESTADOCIVIL: data.estadoCivil,
      };

      const respuesta = await axios.put(`${API_URL}/colaborador/${editandoColaborador!.id}`, colaboradorData);
      console.log("Colaborador actualizado:", respuesta.data);

      const colaboradoresActualizados = colaboradores.map((colaborador) =>
        colaborador.id === editandoColaborador!.id ? { ...colaborador, ...respuesta.data } : colaborador
      );

      setColaboradores(colaboradoresActualizados);
      setEditandoColaborador(null);
      // Se resetea el formulario a valores vacíos
      form.reset({
        nombre: "",
        apellido: "",
        direccion: "",
        edad: 0,
        profesion: "",
        estadoCivil: ""
      });
      toast({
        title: "Colaborador actualizado",
        description: "El colaborador se ha actualizado correctamente",
      });
    } catch (error) {
      console.error("Error al actualizar colaborador:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el colaborador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const confirmarEliminarColaborador = (id: number) => {
    setColaboradorAEliminar(id)
    setShowDeleteModal(true)
  }

  const eliminarColaborador = async () => {
    setLoading(true)
    try {
      await axios.delete(`${API_URL}/colaborador/${colaboradorAEliminar}`)
      console.log("Colaborador eliminado")

      const colaboradoresActualizados = colaboradores.filter((colaborador) => colaborador.id !== colaboradorAEliminar)
      setColaboradores(colaboradoresActualizados)
      toast({
        title: "Colaborador eliminado",
        description: "El colaborador se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar colaborador:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el colaborador",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
      setColaboradorAEliminar(null)
    }
  }

  const determinarNivelRiesgo = (edad: number) => {
    if (edad >= 18 && edad <= 25) {
      setRiesgoInfo({
        mensaje: "FUERA DE PELIGRO",
        tipo: "success",
      })
    } else if (edad >= 26 && edad <= 50) {
      setRiesgoInfo({
        mensaje: "TENGA CUIDADO, TOME TODAS LAS MEDIDAS DE PREVENCIÓN",
        tipo: "warning",
      })
    } else {
      setRiesgoInfo({
        mensaje: "POR FAVOR QUÉDESE EN CASA",
        tipo: "error",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 pb-4 border-b border-gray-200">
          Sistema de Gestión de Colaboradores
        </h1>

        <Collapsible open={!formCollapsed} onOpenChange={setFormCollapsed}>
          <div className="flex items-center space-x-2 mb-4 bg-gray-100 p-3 rounded-lg">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                {formCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-primary" />
                )}
              </Button>
            </CollapsibleTrigger>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <UserPlus className="mr-2 h-6 w-6 text-primary" /> {editandoColaborador ? "Editar Colaborador" : "Agregar Colaborador"}
            </h2>
          </div>
          <CollapsibleContent>
            <Card className="shadow-md border border-gray-200 transition-all duration-200 ease-in-out bg-white rounded-lg overflow-hidden animate-fade-in card-hover-effect">
              <CardContent className="pt-6 px-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(editandoColaborador ? actualizarColaborador : agregarColaborador as any)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingrese el nombre"
                                {...field}
                                className="focus:ring-0 focus:border-gray-900"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apellido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingrese el apellido"
                                {...field}
                                className="focus:ring-0 focus:border-gray-900"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ingrese la dirección"
                              {...field}
                              className="focus:ring-0 focus:border-gray-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="edad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Edad</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ingrese la edad"
                                {...field}
                                className="focus:ring-0 focus:border-gray-900"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="profesion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profesión</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingrese la profesión"
                                {...field}
                                className="focus:ring-0 focus:border-gray-900"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="estadoCivil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Civil</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="focus:ring-0 focus:border-gray-900">
                                <SelectValue placeholder="Seleccione el estado civil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Soltero">Soltero</SelectItem>
                              <SelectItem value="Casado">Casado</SelectItem>
                              <SelectItem value="Divorciado">Divorciado</SelectItem>
                              <SelectItem value="Viudo">Viudo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        {loading ? (editandoColaborador ? "Actualizando..." : "Agregando...") : (editandoColaborador ? "Actualizar Colaborador" : "Agregar Colaborador")}
                        <PlusCircle className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const edad = form.getValues().edad
                          if (edad) {
                            determinarNivelRiesgo(edad)
                          } else {
                            toast({
                              title: "Error",
                              description: "Debe ingresar una edad para determinar el nivel de riesgo",
                              variant: "destructive",
                            })
                          }
                        }}
                        className="flex-1 hover:bg-gray-100 text-gray-900 border-gray-300"
                      >
                        Nivel de Riesgo
                        <AlertTriangle className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
                {riesgoInfo && (
                  <Alert
                    className="mt-6 animate-fade-in"
                    variant={
                      riesgoInfo.tipo === "success"
                        ? "default"
                        : riesgoInfo.tipo === "warning"
                          ? "default"
                          : "destructive"
                    }
                  >
                    <AlertTitle
                      className={`text-lg ${
                        riesgoInfo.tipo === "success"
                          ? "text-green-800"
                          : riesgoInfo.tipo === "warning"
                            ? "text-amber-800"
                            : "text-red-800"
                      }`}
                    >
                      Nivel de Riesgo
                    </AlertTitle>
                    <AlertDescription
                      className={
                        riesgoInfo.tipo === "success"
                          ? "text-green-800 font-semibold"
                          : riesgoInfo.tipo === "warning"
                            ? "text-amber-800 font-semibold"
                            : "text-red-800 font-semibold"
                      }
                    >
                      {riesgoInfo.mensaje}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 text-sm text-gray-500">Información del sistema</span>
          </div>
        </div>

        <Collapsible open={!tableCollapsed} onOpenChange={setTableCollapsed}>
          <div className="flex items-center justify-between mb-4 bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                  {tableCollapsed ? (
                    <ChevronRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Users className="mr-2 h-6 w-6 text-primary" /> Lista de Colaboradores
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={cargarColaboradores}
                disabled={loading}
                className="bg-gray-900 hover:bg-primary/90 text-white"
              >
                {loading ? "Cargando..." : "Cargar Colaboradores"}
                <FileText className="ml-2 h-4 w-4" />
              </Button>

              <Button
                onClick={() => setEditMode(!editMode)}
                disabled={loading}
                variant="outline"
                className="border-gray-300 hover:bg-gray-900 hover:text-white text-gray-900"
              >
                {editMode ? "Terminar Edición" : "Editar"}
                {editMode ? <CheckCircle className="ml-2 h-4 w-4" /> : <Pencil className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
          <CollapsibleContent>
            <Card className="shadow-md border border-gray-200 transition-all duration-200 ease-in-out bg-white rounded-lg overflow-hidden animate-fade-in card-hover-effect">
              <CardContent className="p-0 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900">Nombre</TableHead>
                      <TableHead className="font-semibold text-gray-900">Apellido</TableHead>
                      <TableHead className="font-semibold text-gray-900">Dirección</TableHead>
                      <TableHead className="font-semibold text-gray-900">Edad</TableHead>
                      <TableHead className="font-semibold text-gray-900">Profesión</TableHead>
                      <TableHead className="font-semibold text-gray-900">Estado Civil</TableHead>
                      <TableHead className="font-semibold text-gray-900">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colaboradores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <FileText className="h-16 w-16 text-gray-400" />
                            <p className="text-lg">No hay colaboradores registrados.</p>
                            <p className="text-sm text-gray-400">
                              Haga clic en "Cargar Colaboradores" o agregue uno nuevo.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      colaboradores.map((colaborador, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell>{colaborador.nombre}</TableCell>
                          <TableCell>{colaborador.apellido}</TableCell>
                          <TableCell>{colaborador.direccion}</TableCell>
                          <TableCell>{colaborador.edad}</TableCell>
                          <TableCell>{colaborador.profesion}</TableCell>
                          <TableCell>{colaborador.estadoCivil}</TableCell>
                          <TableCell>
                            {editMode && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editarColaborador(colaborador)}
                                  className="border-gray-300 hover:bg-gray-100 text-gray-900"
                                >
                                  Actualizar
                                  <Pencil className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => confirmarEliminarColaborador(colaborador.id!)}
                                  className="border-gray-300 hover:bg-gray-100 text-gray-900"
                                >
                                  Eliminar
                                  <Trash2 className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <Toaster />
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este colaborador? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={eliminarColaborador}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

