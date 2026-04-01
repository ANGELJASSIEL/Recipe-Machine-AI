import { useState, useRef, useEffect } from "react";
import { generateFusionRecipe, generateRecipeImage, generateRecipeAudio, Recipe } from "./services/geminiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Play, Pause, Download, Trash2, Image as ImageIcon, Music } from "lucide-react";
import { toast, Toaster } from "sonner";
import { get, set } from "idb-keyval";

const COUNTRIES = [
  { code: 'AF', name: 'Afganistán', flag: '🇦🇫' },
  { code: 'AX', name: 'Åland', flag: '🇦🇽' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AI', name: 'Anguila', flag: '🇦🇮' },
  { code: 'AQ', name: 'Antártida', flag: '🇦🇶' },
  { code: 'AG', name: 'Antigua y Barbuda', flag: '🇦🇬' },
  { code: 'SA', name: 'Arabia Saudita', flag: '🇸🇦' },
  { code: 'DZ', name: 'Argelia', flag: '🇩🇿' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AW', name: 'Aruba', flag: '🇦🇼' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaiyán', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Baréin', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belice', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benín', flag: '🇧🇯' },
  { code: 'BM', name: 'Bermudas', flag: '🇧🇲' },
  { code: 'BY', name: 'Bielorrusia', flag: '🇧🇾' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia y Herzegovina', flag: '🇧🇦' },
  { code: 'BW', name: 'Botsuana', flag: '🇧🇼' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunéi', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'BT', name: 'Bután', flag: '🇧🇹' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻' },
  { code: 'KH', name: 'Camboya', flag: '🇰🇭' },
  { code: 'CM', name: 'Camerún', flag: '🇨🇲' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'BQ', name: 'Caribe Neerlandés', flag: '🇧🇶' },
  { code: 'QA', name: 'Catar', flag: '🇶🇦' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'CZ', name: 'República Checa', flag: '🇨🇿' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CY', name: 'Chipre', flag: '🇨🇾' },
  { code: 'VA', name: 'Ciudad del Vaticano', flag: '🇻🇦' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoras', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'CD', name: 'Congo (Rep. Dem.)', flag: '🇨🇩' },
  { code: 'KP', name: 'Corea del Norte', flag: '🇰🇵' },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷' },
  { code: 'CI', name: 'Costa de Marfil', flag: '🇨🇮' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'HR', name: 'Croacia', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CW', name: 'Curazao', flag: '🇨🇼' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: 'DJ', name: 'Yibuti', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EG', name: 'Egipto', flag: '🇪🇬' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'AE', name: 'Emiratos Árabes Unidos', flag: '🇦🇪' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'SCO', name: 'Escocia', flag: '🏴' },
  { code: 'SI', name: 'Eslovenia', flag: '🇸🇮' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'ET', name: 'Etiopía', flag: '🇪🇹' },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭' },
  { code: 'FI', name: 'Finlandia', flag: '🇫🇮' },
  { code: 'FJ', name: 'Fiyi', flag: '🇫🇯' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabón', flag: '🇬🇦' },
  { code: 'WAL', name: 'Gales', flag: '🏴' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GI', name: 'Gibraltar', flag: '🇬🇮' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷' },
  { code: 'GD', name: 'Granada', flag: '🇬🇩' },
  { code: 'GL', name: 'Groenlandia', flag: '🇬🇱' },
  { code: 'GP', name: 'Guadalupe', flag: '🇬🇵' },
  { code: 'GU', name: 'Guam', flag: '🇬🇺' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'GF', name: 'Guayana Francesa', flag: '🇬🇫' },
  { code: 'GG', name: 'Guernsey', flag: '🇬🇬' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GQ', name: 'Guinea Ecuatorial', flag: '🇬🇶' },
  { code: 'GW', name: 'Guinea-Bisáu', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'HT', name: 'Haití', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'HU', name: 'Hungría', flag: '🇭🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ENG', name: 'Inglaterra', flag: '🏴' },
  { code: 'IQ', name: 'Irak', flag: '🇮🇶' },
  { code: 'IR', name: 'Irán', flag: '🇮🇷' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'BV', name: 'Isla Bouvet', flag: '🇧🇻' },
  { code: 'IM', name: 'Isla de Man', flag: '🇮🇲' },
  { code: 'CX', name: 'Isla de Navidad', flag: '🇨🇽' },
  { code: 'NF', name: 'Isla Norfolk', flag: '🇳🇫' },
  { code: 'IS', name: 'Islandia', flag: '🇮🇸' },
  { code: 'KY', name: 'Islas Caimán', flag: '🇰🇾' },
  { code: 'CC', name: 'Islas Cocos', flag: '🇨🇨' },
  { code: 'CK', name: 'Islas Cook', flag: '🇨🇰' },
  { code: 'FO', name: 'Islas Feroe', flag: '🇫🇴' },
  { code: 'GS', name: 'Islas Georgias del Sur y Sándwich del Sur', flag: '🇬🇸' },
  { code: 'HM', name: 'Islas Heard y McDonald', flag: '🇭🇲' },
  { code: 'FK', name: 'Islas Malvinas', flag: '🇫🇰' },
  { code: 'MP', name: 'Islas Marianas del Norte', flag: '🇲🇵' },
  { code: 'MH', name: 'Islas Marshall', flag: '🇲🇭' },
  { code: 'PN', name: 'Islas Pitcairn', flag: '🇵🇳' },
  { code: 'SB', name: 'Islas Salomón', flag: '🇸🇧' },
  { code: 'SJ', name: 'Svalbard y Jan Mayen', flag: '🇸🇯' },
  { code: 'TK', name: 'Tokelau', flag: '🇹🇰' },
  { code: 'TC', name: 'Islas Turcas y Caicos', flag: '🇹🇨' },
  { code: 'UM', name: 'Islas Ultramarinas Menores de los Estados Unidos', flag: '🇺🇲' },
  { code: 'VI', name: 'Islas Vírgenes de los Estados Unidos', flag: '🇻🇮' },
  { code: 'VG', name: 'Islas Vírgenes Británicas', flag: '🇻🇬' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
  { code: 'JE', name: 'Jersey', flag: '🇯🇪' },
  { code: 'JO', name: 'Jordania', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazajistán', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenia', flag: '🇰🇪' },
  { code: 'KG', name: 'Kirguistán', flag: '🇰🇬' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LS', name: 'Lesoto', flag: '🇱🇸' },
  { code: 'LV', name: 'Letonia', flag: '🇱🇻' },
  { code: 'LB', name: 'Líbano', flag: '🇱🇧' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'LY', name: 'Libia', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lituania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxemburgo', flag: '🇱🇺' },
  { code: 'MO', name: 'Macao', flag: '🇲🇴' },
  { code: 'MK', name: 'Macedonia del Norte', flag: '🇲🇰' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MY', name: 'Malasia', flag: '🇲🇾' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MV', name: 'Maldivas', flag: '🇲🇻' },
  { code: 'ML', name: 'Malí', flag: '🇲🇱' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MA', name: 'Marruecos', flag: '🇲🇦' },
  { code: 'MQ', name: 'Martinica', flag: '🇲🇶' },
  { code: 'MU', name: 'Mauricio', flag: '🇲🇺' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'YT', name: 'Mayotte', flag: '🇾🇹' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'MD', name: 'Moldavia', flag: '🇲🇩' },
  { code: 'MC', name: 'Mónaco', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'MS', name: 'Montserrat', flag: '🇲🇸' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'NE', name: 'Níger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'NU', name: 'Niue', flag: '🇳🇺' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: 'NC', name: 'Nueva Caledonia', flag: '🇳🇨' },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿' },
  { code: 'OM', name: 'Omán', flag: '🇴🇲' },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱' },
  { code: 'PK', name: 'Pakistán', flag: '🇵🇰' },
  { code: 'PW', name: 'Palaos', flag: '🇵🇼' },
  { code: 'PS', name: 'Palestina', flag: '🇵🇸' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: 'PG', name: 'Papúa Nueva Guinea', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'PF', name: 'Polinesia Francesa', flag: '🇵🇫' },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'CF', name: 'República Centroafricana', flag: '🇨🇫' },
  { code: 'ZA', name: 'Sudáfrica', flag: '🇿🇦' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴' },
  { code: 'SK', name: 'Eslovaquia', flag: '🇸🇰' },
  { code: 'RE', name: 'Reunión', flag: '🇷🇪' },
  { code: 'RW', name: 'Ruanda', flag: '🇷🇼' },
  { code: 'RO', name: 'Rumania', flag: '🇷🇴' },
  { code: 'RU', name: 'Rusia', flag: '🇷🇺' },
  { code: 'EH', name: 'Sahara Occidental', flag: '🇪🇭' },
  { code: 'MF', name: 'San Martín (Francia)', flag: '🇲🇫' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'AS', name: 'Samoa Americana', flag: '🇦🇸' },
  { code: 'BL', name: 'San Bartolomé', flag: '🇧🇱' },
  { code: 'KN', name: 'San Cristóbal y Nieves', flag: '🇰🇳' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'PM', name: 'San Pedro y Miquelón', flag: '🇵🇲' },
  { code: 'VC', name: 'San Vicente y las Granadinas', flag: '🇻🇨' },
  { code: 'SH', name: 'Santa Elena, Ascensión y Tristán de Acuña', flag: '🇸🇭' },
  { code: 'LC', name: 'Santa Lucía', flag: '🇱🇨' },
  { code: 'ST', name: 'Santo Tomé y Príncipe', flag: '🇸🇹' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leona', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬' },
  { code: 'SX', name: 'San Martín (Países Bajos)', flag: '🇸🇽' },
  { code: 'SY', name: 'Siria', flag: '🇸🇾' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SZ', name: 'Suazilandia', flag: '🇸🇿' },
  { code: 'SD', name: 'Sudán', flag: '🇸🇩' },
  { code: 'SS', name: 'Sudán del Sur', flag: '🇸🇸' },
  { code: 'SE', name: 'Suecia', flag: '🇸🇪' },
  { code: 'CH', name: 'Suiza', flag: '🇨🇭' },
  { code: 'SR', name: 'Surinam', flag: '🇸🇷' },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭' },
  { code: 'TW', name: 'Taiwán', flag: '🇹🇼' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'TJ', name: 'Tayikistán', flag: '🇹🇯' },
  { code: 'IO', name: 'Territorio Británico del Océano Índico', flag: '🇮🇴' },
  { code: 'TF', name: 'Tierras Australes y Antárticas Francesas', flag: '🇹🇫' },
  { code: 'TL', name: 'Timor Oriental', flag: '🇹🇱' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TT', name: 'Trinidad y Tobago', flag: '🇹🇹' },
  { code: 'TN', name: 'Túnez', flag: '🇹🇳' },
  { code: 'TM', name: 'Turkmenistán', flag: '🇹🇲' },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'UA', name: 'Ucrania', flag: '🇺🇦' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistán', flag: '🇺🇿' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'WF', name: 'Wallis y Futuna', flag: '🇼🇫' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabue', flag: '🇿🇼' }
];

const COURSE_TYPES = [
  { id: 'entrante', name: 'Entrante' },
  { id: 'sopa', name: 'Sopa' },
  { id: 'principal', name: 'Plato Principal' },
  { id: 'postre', name: 'Postre' },
  { id: 'todos', name: 'Menú Completo (Todos)' },
];

const DIETARY_PREFERENCES = [
  { id: 'vegano', name: 'Vegano 🌱' },
  { id: 'vegetariano', name: 'Vegetariano 🥗' },
  { id: 'sin_gluten', name: 'Sin Gluten 🌾' },
  { id: 'sin_lactosa', name: 'Sin Lactosa 🥛' },
  { id: 'keto', name: 'Keto 🥩' },
  { id: 'paleo', name: 'Paleo 🍖' },
  { id: 'diabetico', name: 'Diabético 🩸' },
];

const getIngredientIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('ajo') || lowerName.includes('garlic')) return '🧄';
  if (lowerName.includes('cebolla') || lowerName.includes('onion')) return '🧅';
  if (lowerName.includes('tomate') || lowerName.includes('tomato')) return '🍅';
  if (lowerName.includes('carne') || lowerName.includes('res') || lowerName.includes('beef') || lowerName.includes('steak') || lowerName.includes('ternera')) return '🥩';
  if (lowerName.includes('pollo') || lowerName.includes('chicken') || lowerName.includes('ave')) return '🍗';
  if (lowerName.includes('cerdo') || lowerName.includes('pork') || lowerName.includes('tocino') || lowerName.includes('panceta')) return '🥓';
  if (lowerName.includes('pescado') || lowerName.includes('fish') || lowerName.includes('salmón') || lowerName.includes('atún')) return '🐟';
  if (lowerName.includes('camarón') || lowerName.includes('shrimp') || lowerName.includes('langostino') || lowerName.includes('gamba')) return '🍤';
  if (lowerName.includes('queso') || lowerName.includes('cheese') || lowerName.includes('parmesano') || lowerName.includes('mozzarella')) return '🧀';
  if (lowerName.includes('leche') || lowerName.includes('crema') || lowerName.includes('milk') || lowerName.includes('cream') || lowerName.includes('nata')) return '🥛';
  if (lowerName.includes('huevo') || lowerName.includes('egg')) return '🥚';
  if (lowerName.includes('pan') || lowerName.includes('bread') || lowerName.includes('tortilla') || lowerName.includes('baguette')) return '🍞';
  if (lowerName.includes('arroz') || lowerName.includes('rice')) return '🍚';
  if (lowerName.includes('pasta') || lowerName.includes('fideo') || lowerName.includes('noodle') || lowerName.includes('espagueti') || lowerName.includes('macarrón')) return '🍝';
  if (lowerName.includes('papa') || lowerName.includes('potato') || lowerName.includes('patata')) return '🥔';
  if (lowerName.includes('zanahoria') || lowerName.includes('carrot')) return '🥕';
  if (lowerName.includes('limón') || lowerName.includes('lemon') || lowerName.includes('lime') || lowerName.includes('lima')) return '🍋';
  if (lowerName.includes('aceite') || lowerName.includes('oil') || lowerName.includes('oliva')) return '🫒';
  if (lowerName.includes('mantequilla') || lowerName.includes('butter')) return '🧈';
  if (lowerName.includes('sal') || lowerName.includes('salt')) return '🧂';
  if (lowerName.includes('pimienta') || lowerName.includes('pepper')) return '🌶️';
  if (lowerName.includes('chile') || lowerName.includes('ají') || lowerName.includes('picante') || lowerName.includes('jalapeño')) return '🌶️';
  if (lowerName.includes('hierba') || lowerName.includes('cilantro') || lowerName.includes('perejil') || lowerName.includes('herb') || lowerName.includes('albahaca') || lowerName.includes('orégano') || lowerName.includes('romero') || lowerName.includes('tomillo')) return '🌿';
  if (lowerName.includes('agua') || lowerName.includes('water') || lowerName.includes('caldo') || lowerName.includes('fondo')) return '💧';
  if (lowerName.includes('vino') || lowerName.includes('wine') || lowerName.includes('licor')) return '🍷';
  if (lowerName.includes('azúcar') || lowerName.includes('sugar') || lowerName.includes('miel') || lowerName.includes('honey') || lowerName.includes('jarabe')) return '🍯';
  if (lowerName.includes('harina') || lowerName.includes('flour') || lowerName.includes('masa')) return '🌾';
  if (lowerName.includes('frijol') || lowerName.includes('bean') || lowerName.includes('lenteja') || lowerName.includes('garbanzo') || lowerName.includes('alubia')) return '🫘';
  if (lowerName.includes('maíz') || lowerName.includes('elote') || lowerName.includes('corn') || lowerName.includes('choclo')) return '🌽';
  if (lowerName.includes('aguacate') || lowerName.includes('avocado') || lowerName.includes('palta')) return '🥑';
  if (lowerName.includes('manzana') || lowerName.includes('apple')) return '🍎';
  if (lowerName.includes('naranja') || lowerName.includes('orange')) return '🍊';
  if (lowerName.includes('fresa') || lowerName.includes('strawberry') || lowerName.includes('frutilla')) return '🍓';
  if (lowerName.includes('chocolate') || lowerName.includes('cacao') || lowerName.includes('cocoa')) return '🍫';
  if (lowerName.includes('nuez') || lowerName.includes('almendra') || lowerName.includes('nut') || lowerName.includes('cacahuate') || lowerName.includes('maní') || lowerName.includes('pistacho')) return '🥜';
  if (lowerName.includes('hongo') || lowerName.includes('champiñón') || lowerName.includes('mushroom') || lowerName.includes('seta')) return '🍄';
  if (lowerName.includes('salsa') || lowerName.includes('sauce') || lowerName.includes('soja') || lowerName.includes('soya') || lowerName.includes('aderezo')) return '🥣';
  if (lowerName.includes('jengibre') || lowerName.includes('ginger')) return '🫚';
  if (lowerName.includes('pimiento') || lowerName.includes('morrón') || lowerName.includes('bell pepper')) return '🫑';
  if (lowerName.includes('pepino') || lowerName.includes('cucumber')) return '🥒';
  if (lowerName.includes('lechuga') || lowerName.includes('lettuce') || lowerName.includes('espinaca') || lowerName.includes('hoja')) return '🥬';
  if (lowerName.includes('brócoli') || lowerName.includes('broccoli')) return '🥦';
  if (lowerName.includes('coco') || lowerName.includes('coconut')) return '🥥';
  if (lowerName.includes('piña') || lowerName.includes('pineapple')) return '🍍';
  if (lowerName.includes('sandía') || lowerName.includes('watermelon')) return '🍉';
  if (lowerName.includes('uva') || lowerName.includes('grape')) return '🍇';
  if (lowerName.includes('cereza') || lowerName.includes('cherry')) return '🍒';
  if (lowerName.includes('durazno') || lowerName.includes('melocotón') || lowerName.includes('peach')) return '🍑';
  if (lowerName.includes('mango')) return '🥭';
  if (lowerName.includes('kiwi')) return '🥝';
  if (lowerName.includes('melón') || lowerName.includes('melon')) return '🍈';
  if (lowerName.includes('berenjena') || lowerName.includes('eggplant')) return '🍆';
  if (lowerName.includes('calamar') || lowerName.includes('pulpo') || lowerName.includes('squid') || lowerName.includes('octopus')) return '🦑';
  if (lowerName.includes('cangrejo') || lowerName.includes('crab')) return '🦀';
  if (lowerName.includes('langosta') || lowerName.includes('lobster')) return '🦞';
  if (lowerName.includes('ostra') || lowerName.includes('almeja') || lowerName.includes('mejillón') || lowerName.includes('oyster') || lowerName.includes('clam')) return '🦪';
  if (lowerName.includes('cerveza') || lowerName.includes('beer')) return '🍺';
  if (lowerName.includes('café') || lowerName.includes('coffee')) return '☕';
  if (lowerName.includes('té') || lowerName.includes('tea')) return '🍵';
  if (lowerName.includes('jugo') || lowerName.includes('zumo') || lowerName.includes('juice')) return '🧃';
  if (lowerName.includes('hielo') || lowerName.includes('ice')) return '🧊';
  if (lowerName.includes('helado') || lowerName.includes('ice cream')) return '🍨';
  if (lowerName.includes('galleta') || lowerName.includes('cookie')) return '🍪';
  if (lowerName.includes('pastel') || lowerName.includes('tarta') || lowerName.includes('cake')) return '🍰';
  if (lowerName.includes('croissant')) return '🥐';
  if (lowerName.includes('bagel')) return '🥯';
  if (lowerName.includes('pancake') || lowerName.includes('hotcake') || lowerName.includes('panqueque')) return '🥞';
  if (lowerName.includes('waffle') || lowerName.includes('gofre')) return '🧇';
  if (lowerName.includes('pizza')) return '🍕';
  if (lowerName.includes('hamburguesa') || lowerName.includes('burger')) return '🍔';
  if (lowerName.includes('hot dog') || lowerName.includes('perrito')) return '🌭';
  if (lowerName.includes('taco')) return '🌮';
  if (lowerName.includes('burrito')) return '🌯';
  if (lowerName.includes('tamal')) return '🫔';
  if (lowerName.includes('arepa') || lowerName.includes('pupusa')) return '🫓';
  if (lowerName.includes('falafel') || lowerName.includes('albóndiga')) return '🧆';
  if (lowerName.includes('fondue')) return '🫕';
  if (lowerName.includes('ensalada') || lowerName.includes('salad')) return '🥗';
  if (lowerName.includes('sopa') || lowerName.includes('soup')) return '🥣';
  if (lowerName.includes('curry')) return '🍛';
  if (lowerName.includes('sushi')) return '🍣';
  if (lowerName.includes('bento')) return '🍱';
  if (lowerName.includes('dumpling') || lowerName.includes('empanada') || lowerName.includes('gyoza')) return '🥟';
  if (lowerName.includes('camote') || lowerName.includes('batata') || lowerName.includes('sweet potato')) return '🍠';
  if (lowerName.includes('vinagre') || lowerName.includes('vinegar')) return '🍾';
  if (lowerName.includes('mostaza') || lowerName.includes('mustard')) return '🌭';
  if (lowerName.includes('mayonesa') || lowerName.includes('mayo')) return '🥚';
  if (lowerName.includes('yogur') || lowerName.includes('yogurt')) return '🥛';
  
  return '🔸'; // Default icon
};

export interface SavedRecipe extends Recipe {
  id: string;
  customName: string;
  category: string;
  savedAt: number;
  savedImage: string | null;
  savedAudio: string | null;
  country1Code: string;
  country2Code: string;
}

export default function App() {
  const [view, setView] = useState<'generate' | 'saved'>('generate');
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  
  const [country1, setCountry1] = useState<string>("");
  const [country2, setCountry2] = useState<string>("");
  const [courseType, setCourseType] = useState<string>("principal");
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [specificIngredients, setSpecificIngredients] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [recipeAudio, setRecipeAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedCountries, setGeneratedCountries] = useState<{c1: string, c2: string} | null>(null);

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveCustomName, setSaveCustomName] = useState("");
  const [saveCategory, setSaveCategory] = useState("Favoritas");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    get('fusion_saved_recipes').then(val => {
      if (val) setSavedRecipes(val);
    });
  }, []);

  const handleDietaryChange = (id: string, checked: boolean) => {
    if (checked) {
      setDietaryPrefs([...dietaryPrefs, id]);
    } else {
      setDietaryPrefs(dietaryPrefs.filter(p => p !== id));
    }
  };

  const executeGeneration = async (c1: string, c2: string, course: string, prefs: string[], ingredients: string, algs: string) => {
    if (!c1 || !c2) {
      toast.error("Por favor selecciona dos países para la fusión.");
      return;
    }
    if (c1 === c2) {
      toast.error("Por favor selecciona dos países diferentes.");
      return;
    }

    setIsLoading(true);
    setRecipe(null);
    setRecipeImage(null);
    setRecipeAudio(null);
    setGeneratedCountries({ c1, c2 });
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const c1Name = COUNTRIES.find(c => c.code === c1)?.name || c1;
      const c2Name = COUNTRIES.find(c => c.code === c2)?.name || c2;
      const courseName = COURSE_TYPES.find(c => c.id === course)?.name || course;
      const prefsNames = prefs.map(id => DIETARY_PREFERENCES.find(p => p.id === id)?.name || id);

      const generatedRecipe = await generateFusionRecipe(
        c1Name,
        c2Name,
        courseName,
        prefsNames,
        ingredients,
        algs
      );
      setRecipe(generatedRecipe);

      // Generate image and audio in parallel
      const [imgUrl, audioUrl] = await Promise.all([
        generateRecipeImage(generatedRecipe.imagePrompt).catch(e => {
          console.error("Image generation failed", e);
          toast.error("No se pudo generar la imagen de la receta.");
          return null;
        }),
        generateRecipeAudio(generatedRecipe).catch(e => {
          console.error("Audio generation failed", e);
          toast.error("No se pudo generar el audio de la receta.");
          return null;
        })
      ]);

      setRecipeImage(imgUrl);
      setRecipeAudio(audioUrl);
      toast.success("¡Fusión completada! 👨‍🍳");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al generar la receta. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    executeGeneration(country1, country2, courseType, dietaryPrefs, specificIngredients, allergies);
  };

  const handleRandomGenerate = () => {
    const shuffledCountries = [...COUNTRIES].sort(() => 0.5 - Math.random());
    const c1 = shuffledCountries[0].code;
    const c2 = shuffledCountries[1].code;
    const randomCourse = COURSE_TYPES[Math.floor(Math.random() * COURSE_TYPES.length)].id;
    
    setCountry1(c1);
    setCountry2(c2);
    setCourseType(randomCourse);
    setDietaryPrefs([]);
    setSpecificIngredients("");
    setAllergies("");

    executeGeneration(c1, c2, randomCourse, [], "", "");
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    const newSaved: SavedRecipe = {
      ...recipe,
      id: crypto.randomUUID(),
      customName: saveCustomName || recipe.title,
      category: saveCategory || "Favoritas",
      savedAt: Date.now(),
      savedImage: recipeImage,
      savedAudio: recipeAudio,
      country1Code: country1,
      country2Code: country2
    };
    const updated = [...savedRecipes, newSaved];
    setSavedRecipes(updated);
    await set('fusion_saved_recipes', updated);
    setIsSaveDialogOpen(false);
    toast.success("¡Receta guardada exitosamente! 📥");
  };

  const handleDeleteSaved = async (id: string) => {
    const updated = savedRecipes.filter(r => r.id !== id);
    setSavedRecipes(updated);
    await set('fusion_saved_recipes', updated);
    toast.success("Receta eliminada 🗑️");
  };

  const loadSavedRecipe = (saved: SavedRecipe) => {
    setRecipe(saved);
    setRecipeImage(saved.savedImage);
    setRecipeAudio(saved.savedAudio);
    setCountry1(saved.country1Code);
    setCountry2(saved.country2Code);
    setView('generate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = () => {
    if (!recipeAudio) return;
    const a = document.createElement("a");
    a.href = recipeAudio;
    a.download = `${recipe?.title.replace(/\s+/g, '_') || 'receta'}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Audio descargado 🎵");
  };

  const downloadImageWithFlags = async (imageUrl: string, title: string, c1Code?: string, c2Code?: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    await new Promise((resolve, reject) => { 
      img.onload = resolve; 
      img.onerror = reject;
    });
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    if (c1Code && c2Code) {
      const flag1 = COUNTRIES.find(c => c.code === c1Code)?.flag || '';
      const flag2 = COUNTRIES.find(c => c.code === c2Code)?.flag || '';
      
      const padding = 30;
      const fontSize = Math.max(40, Math.floor(canvas.width * 0.05));
      ctx.font = `${fontSize}px serif`;
      const text = `${flag1} + ${flag2}`;
      const textMetrics = ctx.measureText(text);
      
      const rectWidth = textMetrics.width + padding * 4;
      const rectHeight = fontSize + padding * 2;
      const x = 40;
      const y = 40;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, rectWidth, rectHeight, rectHeight / 2);
      } else {
        ctx.rect(x, y, rectWidth, rectHeight);
      }
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + padding * 2, y + rectHeight / 2 + (fontSize * 0.1));
    }

    const a = document.createElement("a");
    a.href = canvas.toDataURL('image/png');
    a.download = `${title.replace(/\s+/g, '_') || 'receta'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Imagen descargada 🖼️");
  };

  const downloadImage = () => {
    if (!recipeImage || !recipe) return;
    downloadImageWithFlags(recipeImage, recipe.title, generatedCountries?.c1, generatedCountries?.c2);
  };

  const downloadSavedImage = (r: SavedRecipe) => {
    if (!r.savedImage) return;
    downloadImageWithFlags(r.savedImage, r.customName, r.country1Code, r.country2Code);
  };

  const downloadSavedAudio = (r: SavedRecipe) => {
    if (!r.savedAudio) return;
    const a = document.createElement("a");
    a.href = r.savedAudio;
    a.download = `${r.customName.replace(/\s+/g, '_')}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Audio descargado 🎵");
  };

  const groupedRecipes = savedRecipes.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, SavedRecipe[]>);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 font-sans selection:bg-amber-900 pb-32">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header */}
      <header className="py-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif tracking-[0.2em] text-amber-500 uppercase">Fusión Infinita</h1>
        <div className="w-24 h-px bg-amber-500/50 mx-auto mt-4"></div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {view === 'generate' ? (
          <div className="flex flex-col gap-12">
            
            {/* Top Image Area */}
            <div className="relative w-full aspect-square md:aspect-[16/9] bg-[#141414] rounded-sm border border-stone-800 overflow-hidden shadow-2xl flex items-center justify-center">
              {recipeImage ? (
                <>
                  <img src={recipeImage} alt="Recipe" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-700 shadow-xl">
                    <span className="text-2xl" title={COUNTRIES.find(c => c.code === generatedCountries?.c1)?.name}>{COUNTRIES.find(c => c.code === generatedCountries?.c1)?.flag}</span>
                    <span className="text-stone-400 text-sm font-bold">+</span>
                    <span className="text-2xl" title={COUNTRIES.find(c => c.code === generatedCountries?.c2)?.name}>{COUNTRIES.find(c => c.code === generatedCountries?.c2)?.flag}</span>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    <Button variant="ghost" size="icon" onClick={downloadImage} className="bg-black/50 hover:bg-black/80 text-white rounded-full h-12 w-12 border border-stone-700 backdrop-blur-md transition-all">
                      <Download size={20} />
                    </Button>
                  </div>
                </>
              ) : recipe ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#141414]">
                  <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 to-[#0a0a0a]">
                   <div className="w-32 h-32 border border-amber-500/30 rounded-full flex items-center justify-center mb-8">
                     <span className="text-5xl opacity-50">🍽️</span>
                   </div>
                   <Button 
                     onClick={handleGenerate} 
                     disabled={isLoading}
                     className="bg-amber-600 hover:bg-amber-700 text-white rounded-none px-10 py-8 text-xl font-serif tracking-[0.15em] uppercase border border-amber-500 transition-all hover:shadow-[0_0_30px_rgba(217,119,6,0.3)]"
                   >
                     {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                     {isLoading ? "Preparando..." : "Generar Receta"}
                   </Button>
                </div>
              )}
              
              {/* Overlay for recipe title if image exists */}
              {recipeImage && recipe && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 pt-24">
                  <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide">{recipe.title}</h2>
                  <p className="text-amber-500 font-serif italic mt-2 text-lg">{recipe.description}</p>
                </div>
              )}
            </div>

            {/* Random Button */}
            <div className="flex justify-center -mt-6 relative z-10">
              <Button 
                onClick={handleRandomGenerate} 
                disabled={isLoading}
                className="bg-[#141414] border border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black rounded-full px-8 py-6 text-sm font-bold tracking-widest uppercase transition-all shadow-xl"
              >
                <span className="text-xl mr-3">🎲</span> Fusión Aleatoria
              </Button>
            </div>

            {/* Michelin Menu (Form) */}
            <div className="bg-[#141414] border border-stone-800 p-6 md:p-8 relative">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-500/50"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-amber-500/50"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-amber-500/50"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-500/50"></div>

              <h3 className="text-center font-serif text-lg text-stone-400 mb-6 uppercase tracking-[0.2em]">Menú Degustación</h3>
              
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="font-serif text-amber-500 tracking-wider uppercase text-[10px]">Origen Uno</Label>
                  <Select value={country1} onValueChange={setCountry1}>
                    <SelectTrigger className="bg-stone-900/50 border border-stone-800 rounded-xl px-4 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 text-base font-serif h-14 transition-all hover:bg-stone-800/50">
                      <SelectValue>
                        {country1 ? (
                          <span className="flex items-center gap-3">
                            <span className="text-3xl drop-shadow-md">{COUNTRIES.find(c => c.code === country1)?.flag}</span>
                            <span className="text-stone-200">{COUNTRIES.find(c => c.code === country1)?.name}</span>
                          </span>
                        ) : (
                          <span className="text-stone-500 flex items-center gap-3">
                            <span className="text-3xl opacity-50">🏳️</span>
                            Seleccionar país...
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-stone-800 text-stone-200 max-h-[250px]">
                      {COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.code} className="focus:bg-stone-800 focus:text-amber-500 cursor-pointer font-serif text-sm py-2">
                          <span className="mr-2 text-lg">{c.flag}</span> {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-serif text-amber-500 tracking-wider uppercase text-[10px]">Origen Dos</Label>
                  <Select value={country2} onValueChange={setCountry2}>
                    <SelectTrigger className="bg-stone-900/50 border border-stone-800 rounded-xl px-4 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 text-base font-serif h-14 transition-all hover:bg-stone-800/50">
                      <SelectValue>
                        {country2 ? (
                          <span className="flex items-center gap-3">
                            <span className="text-3xl drop-shadow-md">{COUNTRIES.find(c => c.code === country2)?.flag}</span>
                            <span className="text-stone-200">{COUNTRIES.find(c => c.code === country2)?.name}</span>
                          </span>
                        ) : (
                          <span className="text-stone-500 flex items-center gap-3">
                            <span className="text-3xl opacity-50">🏳️</span>
                            Seleccionar país...
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-stone-800 text-stone-200 max-h-[250px]">
                      {COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.code} className="focus:bg-stone-800 focus:text-amber-500 cursor-pointer font-serif text-sm py-2">
                          <span className="mr-2 text-lg">{c.flag}</span> {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="font-serif text-amber-500 tracking-wider uppercase text-[10px]">Tiempos</Label>
                  <Select value={courseType} onValueChange={setCourseType}>
                    <SelectTrigger className="bg-stone-900/50 border border-stone-800 rounded-xl px-4 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 text-base font-serif h-14 transition-all hover:bg-stone-800/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-stone-800 text-stone-200">
                      {COURSE_TYPES.map(c => (
                        <SelectItem key={c.id} value={c.id} className="focus:bg-stone-800 focus:text-amber-500 cursor-pointer font-serif text-sm py-2">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 md:col-span-2 mt-2">
                  <Label className="font-serif text-amber-500 tracking-wider uppercase text-[10px] block text-center">Preferencias Dietéticas</Label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {DIETARY_PREFERENCES.map(pref => (
                      <label key={pref.id} className={`cursor-pointer px-4 py-1.5 border rounded-full text-xs font-serif tracking-wider transition-all ${dietaryPrefs.includes(pref.id) ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-stone-800 text-stone-400 hover:border-stone-600'}`}>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={dietaryPrefs.includes(pref.id)}
                          onChange={(e) => handleDietaryChange(pref.id, e.target.checked)}
                        />
                        {pref.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recipe Details */}
            {recipe && (
              <div className="bg-[#141414] border border-stone-800 p-8 md:p-12 mt-4 relative">
                <div className="flex justify-between items-center mb-12 border-b border-stone-800 pb-6">
                  <h3 className="font-serif text-2xl text-amber-500 tracking-widest uppercase">La Receta</h3>
                  {/* Audio controls */}
                  {recipeAudio && (
                    <div className="flex items-center gap-4">
                      <audio ref={audioRef} src={recipeAudio} onEnded={() => setIsPlaying(false)} className="hidden" />
                      <Button variant="ghost" size="icon" onClick={toggleAudio} className="text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 rounded-full h-12 w-12 border border-amber-500/30">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={downloadAudio} className="text-stone-400 hover:text-white hover:bg-stone-800 rounded-full h-12 w-12 border border-stone-800">
                        <Download size={20} />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                  <div className="md:col-span-1">
                    <h4 className="font-serif text-lg text-stone-400 tracking-widest uppercase mb-6">Ingredientes</h4>
                    <ul className="space-y-4">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex justify-between items-end border-b border-stone-800 pb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl" aria-hidden="true">{getIngredientIcon(ing.name)}</span>
                            <a 
                              href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(ing.searchQuery)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-serif text-stone-200 hover:text-amber-500 hover:underline transition-colors"
                              title={`Buscar ${ing.name} en Google Shopping`}
                            >
                              {ing.name}
                            </a>
                          </div>
                          <span className="font-serif text-amber-500/80 text-sm">{ing.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-serif text-lg text-stone-400 tracking-widest uppercase mb-6">Preparación</h4>
                    <div className="space-y-8">
                      {recipe.instructions.map((inst, idx) => (
                        <div key={idx} className="flex gap-6">
                          <div className="font-serif text-2xl text-amber-500/50 italic">{inst.step}</div>
                          <p className="font-serif text-stone-300 leading-relaxed text-lg pt-1">{inst.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-16 flex justify-center border-t border-stone-800 pt-12">
                  <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                    <DialogTrigger render={<Button className="bg-transparent hover:bg-amber-500/10 text-amber-500 border border-amber-500 rounded-none px-12 py-8 text-xl font-serif tracking-[0.2em] uppercase transition-all" />}>
                      Guardar Receta <span className="ml-4 text-3xl">📥</span>
                    </DialogTrigger>
                    <DialogContent className="bg-[#141414] border border-stone-800 text-stone-200 rounded-none">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-amber-500 tracking-widest uppercase text-center mb-4">Guardar en Colección</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <Label className="font-serif text-stone-400 tracking-widest uppercase text-xs">Nombre de la creación</Label>
                          <Input 
                            value={saveCustomName} 
                            onChange={e => setSaveCustomName(e.target.value)} 
                            placeholder={recipe.title} 
                            className="bg-transparent border-0 border-b border-stone-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-amber-500 font-serif text-lg h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-serif text-stone-400 tracking-widest uppercase text-xs">Categoría</Label>
                          <Input 
                            value={saveCategory} 
                            onChange={e => setSaveCategory(e.target.value)} 
                            placeholder="Ej. Degustación, Cenas..." 
                            className="bg-transparent border-0 border-b border-stone-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-amber-500 font-serif text-lg h-12"
                          />
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)} className="font-serif tracking-widest uppercase text-stone-400 hover:text-white hover:bg-stone-800 rounded-none">Cancelar</Button>
                        <Button onClick={handleSaveRecipe} className="bg-amber-600 hover:bg-amber-700 text-white font-serif tracking-widest uppercase rounded-none px-8">Guardar 📥</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Saved Recipes View */
          <div className="flex flex-col gap-12">
            <h2 className="text-3xl font-serif text-amber-500 tracking-[0.2em] uppercase text-center border-b border-stone-800 pb-8">Colección Privada</h2>
            
            {Object.keys(groupedRecipes).length === 0 ? (
              <div className="text-center py-32 border border-stone-800 bg-[#141414]">
                <span className="text-6xl mb-6 block opacity-20">🍽️</span>
                <p className="font-serif text-stone-500 text-xl tracking-widest uppercase">Colección vacía</p>
              </div>
            ) : (
              (Object.entries(groupedRecipes) as [string, SavedRecipe[]][]).map(([category, recipes]) => (
                <div key={category} className="mb-12">
                  <h3 className="font-serif text-xl text-stone-400 tracking-widest uppercase mb-8 flex items-center gap-4">
                    <span className="w-8 h-px bg-stone-700"></span>
                    {category}
                    <span className="flex-1 h-px bg-stone-800"></span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recipes.map(r => (
                      <Card 
                        key={r.id} 
                        className="bg-[#141414] border border-stone-800 rounded-none overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all group"
                        onClick={() => loadSavedRecipe(r)}
                      >
                        {r.savedImage ? (
                          <div className="aspect-[4/3] w-full relative overflow-hidden">
                            <img src={r.savedImage} alt={r.customName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute top-4 left-4 flex gap-2">
                              <span className="bg-black/60 backdrop-blur-md text-sm px-2 py-1 border border-stone-700">
                                {COUNTRIES.find(c => c.code === r.country1Code)?.flag}
                              </span>
                              <span className="bg-black/60 backdrop-blur-md text-sm px-2 py-1 border border-stone-700">
                                {COUNTRIES.find(c => c.code === r.country2Code)?.flag}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[4/3] w-full bg-stone-900 flex items-center justify-center border-b border-stone-800">
                            <span className="text-4xl opacity-20">🍲</span>
                          </div>
                        )}
                        <CardHeader className="p-6 pb-4">
                          <CardTitle className="font-serif text-xl text-stone-200 line-clamp-1">{r.customName}</CardTitle>
                          <CardDescription className="font-serif text-stone-500 italic line-clamp-2 mt-2">{r.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-6 pt-0 flex justify-between items-center">
                          <span className="font-serif text-xs text-stone-600 tracking-widest uppercase">
                            {new Date(r.savedAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            {r.savedImage && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-stone-600 hover:text-amber-500 hover:bg-amber-500/10 rounded-full"
                                onClick={(e) => { e.stopPropagation(); downloadSavedImage(r); }}
                                title="Descargar Imagen"
                              >
                                <ImageIcon size={18} />
                              </Button>
                            )}
                            {r.savedAudio && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-stone-600 hover:text-amber-500 hover:bg-amber-500/10 rounded-full"
                                onClick={(e) => { e.stopPropagation(); downloadSavedAudio(r); }}
                                title="Descargar Audio"
                              >
                                <Music size={18} />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-stone-600 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                              onClick={(e) => { e.stopPropagation(); handleDeleteSaved(r.id); }}
                              title="Eliminar Receta"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-md border-t border-stone-800 p-4 flex justify-center gap-4 z-50">
        <button
          onClick={() => { setView('generate'); setRecipe(null); setRecipeImage(null); setRecipeAudio(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex-1 max-w-[200px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-serif text-xs tracking-[0.2em] uppercase transition-all duration-500 ${view === 'generate' ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]' : 'text-stone-400 hover:text-amber-500 bg-[#141414] border border-stone-800'}`}
        >
          <span className="text-xl">👨‍🍳</span> Generar
        </button>
        <button
          onClick={() => { setView('saved'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex-1 max-w-[200px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-serif text-xs tracking-[0.2em] uppercase transition-all duration-500 ${view === 'saved' ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]' : 'text-stone-400 hover:text-amber-500 bg-[#141414] border border-stone-800'}`}
        >
          <span className="text-xl">📚</span> Guardadas
        </button>
      </nav>
    </div>
  );
}
