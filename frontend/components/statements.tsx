import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Type for the props being passed in the form
interface StatementFormProps {
  form: UseFormReturn<any>;
}

const StatementForm = ({ form }: StatementFormProps) => {
  const {
    fields: statementFields,
    append: appendStatement,
    remove: removeStatement,
  } = useFieldArray({
    control: form.control,
    name: "statements",
  });

  return (
    <div>
      <Card id="statement">
        <CardHeader>
          <CardTitle>Statements/Pernyataan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1">
          {statementFields.map((field, index) => (
            <FormField
              key={field.id}
              name={`statements.${index}.statement`}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    {statementFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeStatement(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            size="sm"
            className="mt-2 w-10 h-10 flex items-center justify-center mx-auto"
            onClick={() => appendStatement({ statement: "" })}
          >
            <p className="text-xl">+</p>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatementForm;
