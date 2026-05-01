import { useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { FormModal } from "@/components/modals/FormModal";
import { FormInput } from "@/components/forms/FormInput";
import { FormDatePicker } from "@/components/forms/FormDatePicker";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormSubmitButton } from "@/components/forms/FormSubmitButton";
import { useCreateSacrament } from "../hooks/useCreateSacrament";
import { useSacraments } from "../hooks/useSacraments";
import { useMembers } from "@/features/members/hooks/useMembers";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { Button } from "@/components/ui/button";
import {
  SACRAMENT_TYPES,
  getAvailableSacramentTypes,
  type SacramentType,
} from "@/constants/sacrament-types";
import type { CreateSacramentPayload } from "@/types";

const godparentSchema = z.object({
  name: z.string().trim().optional(),
  role: z.string().trim().default("Padrino/Madrina"),
});

const createSchema = z.object({
  memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Selecciona un miembro"),
  type: z.enum(SACRAMENT_TYPES),
  date: z.string().optional(),          // ← antes: z.string().min(1, "Requerida")
  place: z.string().trim().optional(),
  celebrant: z.string().trim().optional(),
  godparents: z.array(godparentSchema).optional(),
}).refine(
  (data) => {
    // date only required when type is NOT "Ninguno"
    if (data.type !== "Ninguno" && (!data.date || data.date.trim() === "")) {
      return false;
    }
    return true;
  },
  { message: "La fecha es requerida", path: ["date"] },
);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSacramentModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateSacrament();
  const { notifyCreated } = useNotificationActions();

  // 1. Obtenemos a todos los miembros y todos los sacramentos globales
  const { data: membersData, isLoading: membersLoading } = useMembers({
    limit: 100,
  });
  const { data: allSacramentsData } = useSacraments({ limit: 100 });

  const members = membersData?.data ?? [];
  const allSacraments = allSacramentsData?.data ?? [];

  // 2. Filtramos miembros que AÚN TIENEN sacramentos disponibles
  const availableMembers = useMemo(() => {
    return members.filter((member) => {
      const memberSacraments = allSacraments
        .filter((s) => {
          const memberIdStr =
            typeof s.memberId === "object" ? s.memberId._id : s.memberId;
          return memberIdStr === member._id;
        })
        .map((s) => s.type as SacramentType);

      const available = getAvailableSacramentTypes(memberSacraments);
      return available.length > 0;
    });
  }, [members, allSacraments]);

  // 3. Opciones para el Select
  const memberOptions = availableMembers.map((m) => ({
    value: m._id,
    label: m.fullName,
  }));

  const form = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: {
      memberId: "",
      type: "Bautismo" as const,
      date: "",
      place: "",
      celebrant: "",
      godparents: [],
    },
  });

  const selectedMemberId = form.watch("memberId");
  const selectedType = form.watch("type");
  
  const existingTypes = useMemo(() => {
    if (!selectedMemberId) return [];
    return allSacraments
      .filter((s) => {
        const memberIdStr =
          typeof s.memberId === "object" ? s.memberId._id : s.memberId;
        return memberIdStr === selectedMemberId;
      })
      .map((s) => s.type as SacramentType);
  }, [allSacraments, selectedMemberId]);

  const availableTypes = useMemo(
    () => getAvailableSacramentTypes(existingTypes),
    [existingTypes],
  );

  const typeOptions = availableTypes.map((t) => ({ value: t, label: t }));

  useEffect(() => {
    if (selectedMemberId && availableTypes.length > 0) {
      const currentType = form.getValues("type");
      if (!availableTypes.includes(currentType as SacramentType)) {
        form.setValue("type", availableTypes[0]);
      }
    }
  }, [selectedMemberId, availableTypes, form]);

  const existingLabel = useMemo(() => {
    if (existingTypes.includes("Confirmación"))
      return "Confirmación (Bautismo + Primera Comunión)";
    if (existingTypes.includes("Primera Comunión"))
      return "Primera Comunión (Bautismo)";
    if (existingTypes.includes("Bautismo")) return "Bautismo";
    if (existingTypes.includes("Ninguno")) return "Ninguno";
    if (existingTypes.length === 0) return null;
    return existingTypes.join(", ");
  }, [existingTypes]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "godparents",
  });

const onSubmit = async (values: z.infer<typeof createSchema>) => {
    try {
      // 1. Clonamos los valores en un nuevo objeto maletín
      const payloadToSend: Partial<z.infer<typeof createSchema>> = { ...values };

      // 2. Limpieza profunda: Si es "Ninguno", no mandamos NADA de lo demás
      if (payloadToSend.type === "Ninguno") {
        delete payloadToSend.date;
        delete payloadToSend.place;
        delete payloadToSend.celebrant;
        payloadToSend.godparents = [];
      } else {
        // Si sí hay sacramento pero dejaron campos vacíos, los borramos para que Zod aplique el .optional()
        if (payloadToSend.place === "") delete payloadToSend.place;
        if (payloadToSend.celebrant === "") delete payloadToSend.celebrant;
        
        // (Opcional pero recomendado) Arreglar el salto de zona horaria antes de enviarlo
        if (payloadToSend.date) {
           payloadToSend.date = new Date(payloadToSend.date + 'T12:00:00').toISOString();
        }
      }

      // 3. Enviamos el maletín limpio a Axios
      await createMutation.mutateAsync(payloadToSend as CreateSacramentPayload);
      
      notifyCreated("Sacramento", values.type);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo sacramento"
      size="5xl" // Volvemos a 5xl para que quepan las dos columnas cómodamente
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {/* Contenedor en 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ════ COLUMNA IZQUIERDA: Datos del Sacramento ════ */}
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <FormSelect
                  name="memberId"
                  control={form.control}
                  label="Miembro"
                  options={memberOptions}
                  placeholder={
                    membersLoading
                      ? "Cargando miembros..."
                      : availableMembers.length === 0
                        ? "Todos completaron sus sacramentos"
                        : "Seleccionar miembro..."
                  }
                />

                {selectedMemberId && existingTypes.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Tiene: {existingLabel}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    name="type"
                    control={form.control}
                    label="Tipo de sacramento"
                    options={typeOptions}
                    placeholder={
                      !selectedMemberId
                        ? "Primero selecciona un miembro"
                        : availableTypes.length === 0
                          ? "No hay sacramentos disponibles"
                          : "Seleccionar tipo"
                    }
                  />
                  {selectedType !== "Ninguno" && (
                    <FormDatePicker
                      name="date"
                      control={form.control}
                      label="Fecha"
                    />
                  )}
                </div>

                {selectedType !== "Ninguno" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      name="place"
                      control={form.control}
                      label="Lugar"
                      placeholder="Parroquia..."
                    />
                    <FormInput
                      name="celebrant"
                      control={form.control}
                      label="Celebrante"
                      placeholder="Padre..."
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* ════ COLUMNA DERECHA: Padrinos o Mensaje "Ninguno" ════ */}
            {selectedType !== "Ninguno" ? (
              <div className="bg-muted/30 p-4 rounded-lg border flex flex-col h-full min-h-75">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold">Padrinos</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ name: "", role: "Padrino/Madrina" })
                    }
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Agregar
                  </Button>
                </div>
                
                {fields.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-md p-6">
                    <p className="text-sm text-center">No hay padrinos registrados.<br/>Haz clic en "Agregar".</p>
                  </div>
                )}

                <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                  {fields.map((f, i) => (
                    <div
                      key={f.id}
                      className="flex items-start gap-3 p-3 rounded-md border bg-background relative"
                    >
                      {/* Como el espacio es más angosto, regresamos Nombre y Rol a estar uno debajo del otro */}
                      <div className="flex-1 space-y-2 pr-6">
                        <FormInput
                          name={`godparents.${i}.name`}
                          control={form.control}
                          label="Nombre"
                        />
                        <FormInput
                          name={`godparents.${i}.role`}
                          control={form.control}
                          label="Rol"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive"
                        onClick={() => remove(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 p-6 rounded-lg border flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground text-center">
                  "Ninguno" indica que este miembro no tiene sacramentos
                  registrados.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <FormSubmitButton
              isSubmitting={createMutation.isPending}
              label="Registrar sacramento"
              className="w-full sm:w-auto px-8"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}