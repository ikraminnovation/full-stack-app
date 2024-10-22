import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EditIcon } from "lucide-react";
import Image from "next/image";
import type {
  UseFormRegister,
  UseFormWatch,
  FieldError,
} from "react-hook-form";
import { FormDescription } from "../ui/form";

interface ImageInputProps {
  watch: UseFormWatch<any>;
  register: UseFormRegister<any>;
  name: string;
  imageError?: string | FieldError;
}

export const ImageInput = ({
  watch,
  register,
  imageError,
  name,
}: ImageInputProps) => {
  let imageSrc = "https://avatar.vercel.sh/z";

  if (watch(name)?.length === 1) {
    imageSrc = URL.createObjectURL(watch(name)[0]);
  } else if (watch(name)?.length) {
    imageSrc = watch(name);
  }
  return (
    <>
      <div
        className={cn("flex w-max flex-col gap-2", {
          "mb-7": !imageError,
        })}
      >
        <div className="relative w-max">
          <Image
            src={imageSrc}
            alt={"user photo"}
            width={144}
            height={144}
            className="h-36 w-36 rounded-full object-cover"
          />
          <label
            htmlFor={name}
            className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-white p-2"
          >
            <EditIcon className="h-4 w-4" />
          </label>
        </div>
        <FormDescription>This is your public display image.</FormDescription>
        {imageError && (
          <p className="text-end text-sm font-normal text-red-500">
            {String(imageError)}
          </p>
        )}
      </div>
      <Input
        id={name}
        type="file"
        accept="image/*"
        {...register(name)}
        className="hidden"
      />
    </>
  );
};
