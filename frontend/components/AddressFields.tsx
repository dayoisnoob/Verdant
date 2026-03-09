"use client";

import { addUserAddress } from "@/lib/api";
import { NIGERIAN_STATES } from "@/lib/constants";
import { ApiError } from "@/util";
import { AddressFormData, addressSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.65rem] font-bold uppercase tracking-wider text-verdant-muted">
        {label}
      </label>
      {children}
      {error && <p className="text-[0.7rem] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

export const inputCls =
  "border border-[#e8e8e8] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]";

export const AddressFields = ({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<AddressFormData>>["register"];
  errors: Partial<Record<keyof AddressFormData, { message?: string }>>;
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName?.message}>
          <input
            {...register("firstName")}
            type="text"
            placeholder="First Name"
            className={inputCls}
          />
        </Field>
        <Field label="Last name (optional)" error={errors.lastName?.message}>
          <input
            {...register("lastName")}
            type="text"
            placeholder="Last Name"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Street address" error={errors.streetAddress?.message}>
        <input
          {...register("streetAddress")}
          type="text"
          placeholder="Street Address"
          className={inputCls}
        />
      </Field>

      <Field label="State" error={errors.state?.message}>
        <select {...register("state")} className={inputCls}>
          <option value="">Select state</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone" error={errors.phone1?.message}>
          <div className="flex">
            <span className="flex items-center px-3.5 bg-[#f5f5f5] border border-r-0 border-[#e8e8e8] rounded-l-xl text-sm text-verdant-muted font-medium">
              +234
            </span>
            <input
              {...register("phone1")}
              type="tel"
              placeholder="Main Phone"
              className={`${inputCls} rounded-l-none flex-1`}
            />
          </div>
        </Field>
        <Field label="Alt phone (optional)" error={errors.phone2?.message}>
          <div className="flex">
            <span className="flex items-center px-3.5 bg-[#f5f5f5] border border-r-0 border-[#e8e8e8] rounded-l-xl text-sm text-verdant-muted font-medium">
              +234
            </span>
            <input
              {...register("phone2")}
              type="tel"
              placeholder="Alt Phone"
              className={`${inputCls} rounded-l-none flex-1`}
            />
          </div>
        </Field>
      </div>
    </>
  );
};

export const AddAddressForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({ resolver: zodResolver(addressSchema) });

  const onSubmit = async (data: AddressFormData) => {
    try {
      await addUserAddress(data);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added");
      reset();
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        for (const { field, message } of err.errors) {
          setError(field as keyof AddressFormData, { message });
        }
      } else {
        toast.error("Something went wrong, please try again");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <AddressFields register={register} errors={errors} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none mt-1"
      >
        {isSubmitting ? "Adding…" : "Add Address"}
      </button>
    </form>
  );
};
