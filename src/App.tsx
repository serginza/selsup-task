import React, { useCallback, useEffect, useMemo, useState } from "react";

// Компонент построрен на UseState и useEffect с использованием мемоизации.
// форма редактирования и форма вывода вынесены в отдельные компоненты.
// Кнопка "Add param" input'ы на форме "Param editor" блокируются для всех типов, кроме "string" (по заданию обрабатываем только строки)
// Кнопка "Get model" выводит все данные из формы вывода в консоль

interface Param {
  id: number;
  name: string;
  type: "string" | "number" | "select";
}

interface ParamValue {
  paramId: number;
  value: string;
}

interface Model {
  paramValues: ParamValue[];
}

// добавлен undefined для отработки моков (т.к. приложение в одном файле)
interface Props {
  params?: Param[];
  model?: Model;
}

type AllParams = Param & Omit<ParamValue, "paramId">;

interface Styles {
  container: React.CSSProperties;
  form: React.CSSProperties;
  lastChildForm: React.CSSProperties;
  getModelButton: React.CSSProperties;
  resultForm: React.CSSProperties;
  inputField: React.CSSProperties;
}

const styles: Styles = {
  container: {
    margin: "5px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  form: {
    outline: "1px solid black",
    borderRadius: "5px",
    padding: "10px",
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "10px",
  },
  lastChildForm: {
    alignSelf: "center",
  },
  getModelButton: {
    marginTop: "10px",
    gridColumn: "1 / span 2",
    alignSelf: "center",
  },
  resultForm: {
    outline: "1px solid grey",
    borderRadius: "5px",
    marginTop: "10px",
    padding: "10px",
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "10px",
  },
  inputField: {
    gridColumn: "2",
    width: "100%",
  },
};

const __mockParams__: Param[] = [
  {
    id: 1,
    name: "Назначение",
    type: "string",
  },
  {
    id: 2,
    name: "Длина",
    type: "string",
  },
  {
    id: 3,
    name: "Возраст",
    type: "string",
  },
];

const __mockModel__: Model = {
  paramValues: [
    {
      paramId: 1,
      value: "повседневное",
    },
    {
      paramId: 2,
      value: "макси",
    },
    {
      paramId: 3,
      value: "25",
    },
  ],
};

const SELECTOR_TYPES = ["string", "number", "select"] as const;

const generateId = () => Date.now();

function ParamEditor({
  allParams,
  setAllParams,
}: {
  allParams: AllParams[];
  setAllParams: React.Dispatch<React.SetStateAction<AllParams[]>>;
}) {
  const [name, setName] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [type, setType] = useState<Param["type"]>("string");

  const onChangeSelector = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value as Param["type"]);
    setName("");
    setValue("");
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const onAddParams = () => {
    if (name && value) {
      setAllParams([...allParams, { id: generateId(), name, value, type }]);
      setName("");
      setValue("");
    }
  };

  const disableFormField = type === "number" || type === "select";

  return (
    <>
      <h3>Param editor</h3>
      <form style={styles.form}>
        <label>Type</label>
        <select value={type} onChange={onChangeSelector}>
          {SELECTOR_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={onChangeName}
          placeholder="Name input"
          disabled={disableFormField}
        />
        <label>Value</label>
        <input
          type="text"
          value={value}
          onChange={onChangeValue}
          placeholder="Value input"
          disabled={disableFormField}
        />
        <button
          style={styles.getModelButton}
          type="button"
          onClick={onAddParams}
          disabled={disableFormField}
        >
          Add param
        </button>
      </form>
    </>
  );
}

function ParamsList({
  allParams,
  setAllParams,
}: {
  allParams: AllParams[];
  setAllParams: React.Dispatch<React.SetStateAction<AllParams[]>>;
}) {
  const deleteParam = (paramId: AllParams["id"]) => {
    setAllParams(allParams.filter(param => param.id !== paramId));
  };

  const handleChange = useCallback((paramId: AllParams["id"], event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedParams = allParams.map(param => {
      if (param.id === paramId) {
        return { ...param, value: event.target.value };
      }
      return param;
    });
    setAllParams(updatedParams);
  }, [allParams, setAllParams]);

  return (
    <>
      <h3>All params</h3>
      {allParams.length ? (
        <form style={{...styles.form, gridTemplateColumns: "4fr 8fr 1fr",}}>
        {allParams.map((param) => (
          <div key={param.id} style={{ display: "contents" }}>
            <label style={{ textAlign: "right" }}>{param.name}</label>
            <input
              type={param.type}
              value={param.value}
              style={styles.inputField}
              onChange={(e) => handleChange(param.id, e)}
            />
          <button onClick={() => deleteParam(param.id)}>X</button>
          </div>
        ))}
      </form>
      ) : (
        <div>Empty data</div>
      )}
    </>
  );
}

function App({ params = __mockParams__, model = __mockModel__ }: Props) {
  const [allParams, setAllParams] = useState<AllParams[]>([]);

  // Переадаптирование данных в нужный формат
  const initialParams = useMemo(() => {
    const paramsMap = new Map(params.map((p) => [p.id, p]));
  
    return model.paramValues
      .map((paramValue) => {
        const param = paramsMap.get(paramValue.paramId);
        return param
          ? {
              id: param.id,
              name: param.name,
              value: paramValue.value,
              type: param.type,
            }
          : null;
      })
      .filter((param): param is AllParams => param !== null);
  }, [params, model.paramValues]);

  useEffect(() => {
    setAllParams(initialParams);
  }, [initialParams]);

  const getModel = () => {
    console.log(allParams);
  };

  return (
    <div style={styles.container}>
      <ParamEditor allParams={allParams} setAllParams={setAllParams} />
      <ParamsList allParams={allParams} setAllParams={setAllParams}/>
      <button style={styles.getModelButton} onClick={getModel}>
        Get model (console.log)
      </button>
    </div>
  );
}

export default App;
