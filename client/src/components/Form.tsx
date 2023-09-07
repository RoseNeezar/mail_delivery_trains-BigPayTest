import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, UseFormRegisterReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "react-hot-toast";
import useTrainStore from "../hooks/useTrainHook";
import { Packages, Trains, createNetwork } from "../trains/trainNodes";

type InputValues = {
  trains: string;
  packages: string;
  stations: string;
  edges: string;
};

const schema = z.object({
  trains: z.string().min(2, { message: "Please enter train" }),
  packages: z.string().min(2, { message: "Please enter packages" }),
  stations: z.string().min(2, { message: "Please enter stations" }),
  edges: z.string().min(2, { message: "Please enter edges" }),
});

type Props = {
  setOpenForm: (value: React.SetStateAction<boolean>) => void;
  setData: (
    value: React.SetStateAction<{
      trains: Trains[];
      packages: Packages[];
    }>
  ) => void;
};

const FormInput = ({
  defaultVal,
  errors,
  register,
}: {
  defaultVal: string;
  register: UseFormRegisterReturn;
  errors?: FieldError;
}) => {
  return (
    <div className="mb-1">
      <textarea
        {...register}
        rows={5}
        cols={300}
        defaultValue={defaultVal}
        style={{
          border: !errors ? "" : "2px solid red",
        }}
        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  );
};

const TrainForm = (props: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: InputValues) => {
    try {
      props.setData({
        trains: JSON.parse(data.trains),
        packages: JSON.parse(data.packages),
      });

      useTrainStore.setState({
        trains: [],
        packages: [],
        graphNodes: null,
        assignSchedules: [],
        moves: [],
        logger: [],
      });

      //hack, UI node was not rerendering when state change
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 200);
      });
      createNetwork({
        trainsInput: JSON.parse(data.trains),
        edgesInput: JSON.parse(data.edges),
        packagesInput: JSON.parse(data.packages),
        stationsInput: data.stations.split(","),
      });

      props.setOpenForm(false);
    } catch (error) {
      toast.error("Wrong format entered", {
        position: "top-right",
      });
    }
  };

  if (errors.trains) {
    toast.error("Enter train", {
      position: "top-right",
    });
  }

  if (errors.stations) {
    toast.error("Enter stations", {
      position: "top-right",
    });
  }

  if (errors.packages) {
    toast.error("Enter packages", {
      position: "top-right",
    });
  }

  if (errors.edges) {
    toast.error("Enter edges", {
      position: "top-right",
    });
  }

  return (
    <div className="bg-gray-600 text-left">
      <div className="flex min-h-full">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mt-8">
              <div>
                <div className="relative mt-6">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="rounded-lg bg-zinc-500 p-3 text-lg text-white">
                      Create scenario
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <form
                  method="POST"
                  className="space-y-2"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <label className="text-lg font-medium text-white">
                    Trains Input
                  </label>
                  <FormInput
                    defaultVal={`[{
                    "name": "Q1",
                    "capacity": 6,
                    "startingNode": "B"
                  }]`}
                    register={register("trains")}
                    errors={errors.trains}
                  />
                  <label className="text-lg font-medium text-white">
                    Packages Input
                  </label>
                  <FormInput
                    defaultVal={`[{
                    "name": "K1",
                    "capacity": 5,
                    "startingNode": "A",
                    "destinationNode": "C"
                  }]`}
                    register={register("packages")}
                    errors={errors.packages}
                  />
                  <label className="text-lg font-medium text-white">
                    Stations Input
                  </label>
                  <FormInput
                    defaultVal={`A,B,C`}
                    register={register("stations")}
                    errors={errors.stations}
                  />
                  <label className="text-lg font-medium text-white">
                    Edges Input
                  </label>
                  <FormInput
                    defaultVal={`[{
                    "name": "E1",
                    "startingNode": "A",
                    "destinationNode": "B",
                    "time": 30
                  },{
                    "name": "E1",
                    "startingNode": "B",
                    "destinationNode": "A",
                    "time": 30
                  },{
                    "name": "E2",
                    "startingNode": "B",
                    "destinationNode": "C",
                    "time": 10
                  },{
                    "name": "E2",
                    "startingNode": "C",
                    "destinationNode": "B",
                    "time": 10
                  }]`}
                    register={register("edges")}
                    errors={errors.edges}
                  />
                  <button
                    type="submit"
                    className={`btn-primary btn flex w-full justify-center px-4 py-2 text-sm `}
                  >
                    Ok
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainForm;
