import React, { useState } from "react";
import {
  Slider,
  TextField,
  Card,
  CardContent,
  Button,
  FormControlLabel,
  Checkbox
} from "@mui/material";






const SalaryCalculator = () => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    hoursWorked: "",
    rating: 50,
    nightHours: "",
    splitShiftHours: "",
    weekendHours: "",
    mentoringHours: "",
    cityBonus: "",
    pzvShifts: "",
    experienceYears: "",
    overtimeMonth: new Date().toLocaleString('ru-RU', { month: 'short' }).toLowerCase(),
    obkHours: "",
    preTripCheck: false,
    tachograph: false,
    electricBus: false,
    locationBonus: false,
    unionMember: false
  });

  const [results, setResults] = useState(null);

  const normHoursByMonth = {
    "янв": 136,
    "фев": 160,
    "мар": 167,
    "апр": 175,
    "май": 144,
    "июн": 151,
    "июл": 184,
    "авг": 168,
    "сен": 176,
    "окт": 184,
    "ноя": 151,
    "дек": 176
  };

const trackedFields = [
  "nightHours",
  "splitShiftHours",
  "weekendHours",
  "mentoringHours",
  "cityBonus",
  "obkHours"
];

const fieldLabels = {
  nightHours: "Количество часов в ночное время",
  splitShiftHours: "Часы разделённых смен",
  weekendHours: "Количество часов в выходные или праздники",
  mentoringHours: "Количество часов в роли инструктора",
  cityBonus: "Количество часов в центре города",
  obkHours: "Количество часов на ОБК"
};

const validateFields = (field, value) => {
  const worked = Number(formData.hoursWorked || 0);
  const num = Number(value || 0);

  if (trackedFields.includes(field)) {
    if (num > worked) {
      setErrors(prev => ({
        ...prev,
        [field]: `${fieldLabels[field]} не может быть больше количества отработанных часов`
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  // обновим ошибки, если поле "Количество отработанных часов" изменилось
  if (field === "hoursWorked") {
    const newErrors = { ...errors };
    trackedFields.forEach(f => {
      const fieldValue = Number(formData[f] || 0);
      if (fieldValue > num) {
        newErrors[f] = `${fieldLabels[f]} не может быть больше количества отработанных часов`;
      } else {
        delete newErrors[f];
      }
    });
    setErrors(newErrors);
  }
};


const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  validateFields(field, value);
};

  const calculate = () => {
    const hourlyRate = 434.7;
    const premiumPercent = 0.12 * (formData.rating / 100);
    const nightBonus = 0.4;
    const splitShiftBonus = 0.3;
    const overtimeRate = 672;
    const mentoringRate = 0.45;
    const obkRate = 0.10;
    const sfvRate = 15.2;
    const electricBusRate = 34.66;
    const cityBonusRate = 0.05;
    const pzvMinutes = 40;
    const shiftDuration = 60;

    let experienceBonus = 0;
    if (formData.experienceYears >= 1 && formData.experienceYears <= 4) experienceBonus = 0.10;
    else if (formData.experienceYears >= 5 && formData.experienceYears <= 9) experienceBonus = 0.15;
    else if (formData.experienceYears >= 10) experienceBonus = 0.20;

    const results = [];

    const basePay = formData.hoursWorked * hourlyRate;
    const premiumPay = basePay * premiumPercent;
    const nightPay = formData.nightHours * hourlyRate * nightBonus;
    const splitShiftPay = formData.splitShiftHours * hourlyRate * splitShiftBonus;
    const weekendPay = formData.weekendHours * hourlyRate;
    const experiencePay = formData.hoursWorked * hourlyRate * experienceBonus;
    const mentoringPay = formData.mentoringHours * hourlyRate * mentoringRate;
    const electricBusPay = formData.electricBus ? formData.hoursWorked * electricBusRate : 0;
    const obkPay = formData.obkHours * hourlyRate * 0.10;
    const sfvPay = formData.locationBonus ? Math.min(2500, formData.hoursWorked * sfvRate) : 0;
    const cityPay = formData.cityBonus * hourlyRate * cityBonusRate;
    const pzvPay = formData.pzvShifts * hourlyRate * (pzvMinutes / shiftDuration);

    const hazardPay = formData.hoursWorked * 17.39;

    const normHours = normHoursByMonth[formData.overtimeMonth] || 0;
    const overtimeHours = Math.max(formData.hoursWorked - normHours, 0);
    const overtimePay = overtimeHours * overtimeRate;

    results.push({ name: "Часы", value: basePay });
    results.push({ name: "Вредные условия труда", value: hazardPay });
    results.push({ name: "Рейтинг", value: premiumPay });
    results.push({ name: "Ночные", value: nightPay });
    results.push({ name: "Разделенные смены", value: splitShiftPay });
    results.push({ name: "Выходные и праздники", value: weekendPay });
    results.push({ name: "Стаж", value: experiencePay });
    results.push({ name: "Наставничество", value: mentoringPay });
    results.push({ name: "ОБК", value: obkPay });
    results.push({ name: "Электробус", value: electricBusPay });
    results.push({ name: "Работа в ФСВ или на площадках Фили, Мневники, Пресня, Нагорная", value: sfvPay });
    results.push({ name: "Центр города", value: cityPay });
    results.push({ name: "ПЗВ", value: pzvPay });
    results.push({ name: "Сверхурочные", value: overtimePay });

    const total = results.reduce((acc, r) => acc + r.value, 0);
    const finalTotal = total * (formData.unionMember ? 0.86 : 0.87);

    results.push({ name: "Вычет НДФЛ и профсоюзного взноса", value: total - finalTotal });
    setResults([...results, { name: "Итого к выплате", value: finalTotal }]);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans" style={{ fontFamily: 'Futura, Helvetica Neue, sans-serif' }}>
      <div className="max-w-3xl mx-auto p-4 space-y-6">
       <div className="flex flex-col items-center mb-6">
          <img src="/logotip_montazhnaja-oblast-1-2048x539.png" alt="Логотип Мосгортранс" className="h-24 mb-2" />
          <h1 className="text-2xl font-bold text-[#1D3D90] text-center">Расчёт заработной платы</h1>
        </div>

        <Card className="shadow-lg">
        <CardContent className="space-y-4">
  {/* Поля с числами + слайдер + селектор месяца */}
  {[
    { label: "Количество отработанных часов", field: "hoursWorked" },
    { label: "Количество часов в ночное время", field: "nightHours" },
    { label: "Количество часов разделённых смен", field: "splitShiftHours" },
    { label: "Количество часов в выходные или праздники", field: "weekendHours" },
    { label: "Количество часов в роли инструктора", field: "mentoringHours" },
    { label: "ПЗВ (введите количество смен)", field: "pzvShifts" },
    { label: "Количество часов в центре города", field: "cityBonus" },
    { label: "Стаж (лет)", field: "experienceYears" },
    { label: "Количество часов на ОБК", field: "obkHours" }
  ].map(({ label, field }) => (
    <div key={field}>
      <label className="font-medium">{label}</label>
<input
  type="number"
  className={`w-full border p-2 rounded ${errors[field] ? 'border-red-500' : ''}`}
  value={formData[field] || ""}
  onChange={e => handleChange(field, Math.round(parseInt(e.target.value.replace(/^0+/, '') || '0')))}
/>
{errors[field] && (
  <p className="text-sm text-red-600 mt-1">{errors[field]}</p>
)}
    </div>
  ))}

  {/* Слайдер рейтинга */}
  <div>
    <label className="font-medium">Рейтинг: {formData.rating}</label>
    <Slider
      step={10}
      min={0}
      max={100}
      value={formData.rating}
      onChange={(_, value) => handleChange("rating", value)}
    />
  </div>

  {/* Селектор месяца */}
  <div>
    <label className="font-medium">Доплата за сверхурочные (месяц)</label>
    <select
      className="w-full border p-2 rounded"
      value={formData.overtimeMonth}
      onChange={e => handleChange("overtimeMonth", e.target.value)}
    >
      {Object.entries({
        "янв": "Январь",
        "фев": "Февраль",
        "мар": "Март",
        "апр": "Апрель",
        "май": "Май",
        "июн": "Июнь",
        "июл": "Июль",
        "авг": "Август",
        "сен": "Сентябрь",
        "окт": "Октябрь",
        "ноя": "Ноябрь",
        "дек": "Декабрь"
      }).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  </div>

  {/* Чекбоксы — вертикально, одинакового размера */}
  <div className="flex flex-col gap-2">
    {[
      { label: "Вождение электробуса", field: "electricBus" },
      { label: "Работа в филиале Северо-Восточный или на площадках  Фили, Мневники, Пресня, Нагорная", field: "locationBonus" },
      { label: "Член профсоюза", field: "unionMember" }
    ].map(({ label, field }) => (
      <label key={field} className="flex items-center gap-2 font-normal">
        <input
          type="checkbox"
          className="w-5 h-5"
          checked={formData[field]}
          onChange={e => handleChange(field, e.target.checked)}
        />
        <span>{label}</span>
      </label>
    ))}
  </div>

  {/* Отдельные чекбоксы */}
  <label className="flex items-center gap-2 font-normal">
    <input
      type="checkbox"
      className="w-5 h-5"
      checked={formData.preTripCheck}
      onChange={() => handleChange("preTripCheck", !formData.preTripCheck)}
    />
    <span>Доплата за медосмотр</span>
  </label>

  <label className="flex items-center gap-2 font-normal">
    <input
      type="checkbox"
      className="w-5 h-5"
      checked={formData.tachograph}
      onChange={() => handleChange("tachograph", !formData.tachograph)}
    />
    <span>Доплата за тахограф</span>
  </label>

  {/* Кнопка расчета */}
<Button
  variant="contained"
  style={{ backgroundColor: '#1D3D90' }}
  onClick={calculate}
  disabled={Object.keys(errors).length > 0}
>
  Рассчитать
</Button>
</CardContent>
        </Card>

        {results && (
          <Card className="shadow-md">
            <CardContent className="space-y-2">
              <h2 className="text-xl font-semibold text-[#1D3D90]">Результат</h2>
              {results.map((res, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{res.name}</span>
                  <span>{res.value.toFixed(2)} ₽</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SalaryCalculator;
