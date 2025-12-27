import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAIAddressSuggestions, isAIConfigured, type AddressSuggestion } from '@/utils/ai-service';

interface AddressPickerProps {
  value?: string; // Format: "street|city|state|zip"
  onChange: (value: string) => void;
  label?: string;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const COMMON_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
  'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
  'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Virginia Beach',
  'Miami', 'Oakland', 'Minneapolis', 'Tulsa', 'Cleveland', 'Wichita', 'Arlington', 'Tampa'
];

// Real US Zip Codes from major metropolitan areas
const REAL_US_ZIP_CODES = [
  // New York, NY
  '10001', '10002', '10003', '10004', '10005', '10006', '10007', '10009', '10010', '10011',
  '10012', '10013', '10014', '10016', '10017', '10018', '10019', '10020', '10021', '10022',
  '10023', '10024', '10025', '10026', '10027', '10028', '10029', '10030', '10031', '10032',
  '10033', '10034', '10035', '10036', '10037', '10038', '10039', '10040', '10044', '10065',
  '10069', '10075', '10128', '10280', '10282',
  // Los Angeles, CA
  '90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90010', '90011',
  '90012', '90013', '90014', '90015', '90016', '90017', '90018', '90019', '90020', '90021',
  '90022', '90023', '90024', '90025', '90026', '90027', '90028', '90029', '90031', '90032',
  '90033', '90034', '90035', '90036', '90037', '90038', '90039', '90040', '90041', '90042',
  '90043', '90044', '90045', '90046', '90047', '90048', '90049', '90056', '90057', '90058',
  '90059', '90061', '90062', '90063', '90064', '90065', '90066', '90067', '90068', '90069',
  '90071', '90077', '90089', '90210', '90211', '90212',
  // Chicago, IL
  '60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610',
  '60611', '60612', '60613', '60614', '60615', '60616', '60617', '60618', '60619', '60620',
  '60621', '60622', '60623', '60624', '60625', '60626', '60628', '60629', '60630', '60631',
  '60632', '60633', '60634', '60636', '60637', '60638', '60639', '60640', '60641', '60642',
  '60643', '60644', '60645', '60646', '60647', '60649', '60651', '60652', '60653', '60654',
  '60655', '60656', '60657', '60659', '60660', '60661',
  // Houston, TX
  '77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010',
  '77011', '77012', '77013', '77014', '77015', '77016', '77017', '77018', '77019', '77020',
  '77021', '77022', '77023', '77024', '77025', '77026', '77027', '77028', '77029', '77030',
  '77031', '77032', '77033', '77034', '77035', '77036', '77037', '77038', '77039', '77040',
  '77041', '77042', '77043', '77044', '77045', '77046', '77047', '77048', '77049', '77050',
  '77051', '77052', '77053', '77054', '77055', '77056', '77057', '77058', '77059', '77060',
  '77061', '77062', '77063', '77064', '77065', '77066', '77067', '77068', '77069', '77070',
  '77071', '77072', '77073', '77074', '77075', '77076', '77077', '77078', '77079', '77080',
  '77081', '77082', '77083', '77084', '77085', '77086', '77087', '77088', '77089', '77090',
  '77091', '77092', '77093', '77094', '77095', '77096', '77098', '77099',
  // Phoenix, AZ
  '85001', '85002', '85003', '85004', '85005', '85006', '85007', '85008', '85009', '85010',
  '85011', '85012', '85013', '85014', '85015', '85016', '85017', '85018', '85019', '85020',
  '85021', '85022', '85023', '85024', '85025', '85026', '85027', '85028', '85029', '85030',
  '85031', '85032', '85033', '85034', '85035', '85036', '85037', '85038', '85039', '85040',
  '85041', '85042', '85043', '85044', '85045', '85046', '85048', '85050', '85051', '85053',
  '85054', '85083', '85085', '85086', '85087',
  // Philadelphia, PA
  '19101', '19102', '19103', '19104', '19105', '19106', '19107', '19108', '19109', '19110',
  '19111', '19112', '19113', '19114', '19115', '19116', '19118', '19119', '19120', '19121',
  '19122', '19123', '19124', '19125', '19126', '19127', '19128', '19129', '19130', '19131',
  '19132', '19133', '19134', '19135', '19136', '19137', '19138', '19139', '19140', '19141',
  '19142', '19143', '19144', '19145', '19146', '19147', '19148', '19149', '19150', '19151',
  '19152', '19153', '19154',
  // San Antonio, TX
  '78201', '78202', '78203', '78204', '78205', '78206', '78207', '78208', '78209', '78210',
  '78211', '78212', '78213', '78214', '78215', '78216', '78217', '78218', '78219', '78220',
  '78221', '78222', '78223', '78224', '78225', '78226', '78227', '78228', '78229', '78230',
  '78231', '78232', '78233', '78234', '78235', '78236', '78237', '78238', '78239', '78240',
  '78241', '78242', '78243', '78244', '78245', '78246', '78247', '78248', '78249', '78250',
  '78251', '78252', '78253', '78254', '78255', '78256', '78257', '78258', '78259', '78260',
  '78261', '78263', '78264', '78265',
  // San Diego, CA
  '92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110',
  '92111', '92112', '92113', '92114', '92115', '92116', '92117', '92118', '92119', '92120',
  '92121', '92122', '92123', '92124', '92126', '92127', '92128', '92129', '92130', '92131',
  '92132', '92134', '92135', '92136', '92137', '92138', '92139', '92140', '92142', '92143',
  '92145', '92147', '92149', '92150', '92152', '92153', '92154', '92155', '92158', '92159',
  '92160', '92161', '92163', '92164', '92165', '92166', '92167', '92168', '92169', '92170',
  '92171', '92172', '92173', '92174', '92175', '92176', '92177', '92178', '92179', '92182',
  '92184', '92186', '92187', '92190', '92191', '92192', '92193', '92195', '92196', '92197',
  '92198', '92199',
  // Dallas, TX
  '75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210',
  '75211', '75212', '75214', '75215', '75216', '75217', '75218', '75219', '75220', '75221',
  '75222', '75223', '75224', '75225', '75226', '75227', '75228', '75229', '75230', '75231',
  '75232', '75233', '75234', '75235', '75236', '75237', '75238', '75240', '75241', '75243',
  '75244', '75246', '75247', '75248', '75249', '75250', '75251', '75252', '75253', '75254',
  '75260', '75261', '75263', '75264', '75265', '75266', '75267', '75270', '75275', '75277',
  '75283', '75284', '75285', '75287',
  // San Jose, CA
  '95110', '95111', '95112', '95113', '95114', '95115', '95116', '95117', '95118', '95119',
  '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129',
  '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95138', '95139', '95140',
  '95141', '95148', '95150', '95151', '95152', '95153', '95154', '95155', '95156', '95157',
  '95158', '95159', '95160', '95161', '95164', '95170', '95172', '95173', '95190', '95191',
  '95192', '95193', '95194', '95196',
  // Austin, TX
  '78701', '78702', '78703', '78704', '78705', '78710', '78712', '78717', '78719', '78721',
  '78722', '78723', '78724', '78725', '78726', '78727', '78728', '78729', '78730', '78731',
  '78732', '78733', '78734', '78735', '78736', '78737', '78738', '78739', '78741', '78742',
  '78744', '78745', '78746', '78747', '78748', '78749', '78750', '78751', '78752', '78753',
  '78754', '78756', '78757', '78758', '78759', '78760', '78761', '78762', '78763', '78764',
  '78765', '78766', '78767', '78768', '78769', '78772', '78773', '78774', '78778', '78779',
  '78780', '78781', '78783', '78785', '78786', '78788', '78789', '78799',
  // Jacksonville, FL
  '32099', '32201', '32202', '32203', '32204', '32205', '32206', '32207', '32208', '32209',
  '32210', '32211', '32212', '32216', '32217', '32218', '32219', '32220', '32221', '32222',
  '32223', '32224', '32225', '32226', '32227', '32228', '32229', '32231', '32232', '32233',
  '32234', '32235', '32236', '32237', '32238', '32239', '32240', '32241', '32244', '32245',
  '32246', '32247', '32250', '32254', '32255', '32256', '32257', '32258', '32259', '32260',
  '32266', '32267', '32277', '32290',
  // San Francisco, CA
  '94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112',
  '94114', '94115', '94116', '94117', '94118', '94121', '94122', '94123', '94124', '94127',
  '94129', '94130', '94131', '94132', '94133', '94134', '94158', '94188',
  // Seattle, WA
  '98101', '98102', '98103', '98104', '98105', '98106', '98107', '98108', '98109', '98110',
  '98111', '98112', '98113', '98114', '98115', '98116', '98117', '98118', '98119', '98121',
  '98122', '98124', '98125', '98126', '98127', '98129', '98131', '98132', '98133', '98134',
  '98136', '98138', '98139', '98144', '98145', '98146', '98148', '98154', '98155', '98158',
  '98160', '98161', '98164', '98165', '98166', '98168', '98170', '98171', '98174', '98175',
  '98177', '98178', '98181', '98184', '98185', '98188', '98190', '98191', '98194', '98195',
  '98198', '98199',
  // Denver, CO
  '80201', '80202', '80203', '80204', '80205', '80206', '80207', '80208', '80209', '80210',
  '80211', '80212', '80214', '80215', '80216', '80217', '80218', '80219', '80220', '80221',
  '80222', '80223', '80224', '80225', '80226', '80227', '80228', '80229', '80230', '80231',
  '80232', '80233', '80234', '80235', '80236', '80237', '80238', '80239', '80241', '80243',
  '80244', '80246', '80247', '80248', '80249', '80250', '80251', '80252', '80256', '80257',
  '80259', '80260', '80261', '80262', '80263', '80264', '80265', '80266', '80271', '80273',
  '80274', '80275', '80279', '80280', '80281', '80290', '80291', '80293', '80294', '80295',
  '80299',
  // Washington, DC
  '20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008', '20009', '20010',
  '20011', '20012', '20013', '20015', '20016', '20017', '20018', '20019', '20020', '20024',
  '20026', '20029', '20030', '20032', '20033', '20035', '20036', '20037', '20038', '20039',
  '20040', '20041', '20042', '20043', '20044', '20045', '20046', '20047', '20049', '20050',
  '20051', '20052', '20053', '20055', '20056', '20057', '20058', '20059', '20060', '20061',
  '20062', '20063', '20064', '20065', '20066', '20067', '20068', '20069', '20070', '20071',
  '20073', '20074', '20075', '20076', '20077', '20078', '20080', '20081', '20082', '20088',
  '20090', '20091', '20097', '20098',
  // Boston, MA
  '02101', '02102', '02103', '02104', '02105', '02106', '02107', '02108', '02109', '02110',
  '02111', '02112', '02113', '02114', '02115', '02116', '02117', '02118', '02119', '02120',
  '02121', '02122', '02124', '02125', '02126', '02127', '02128', '02129', '02130', '02131',
  '02132', '02133', '02134', '02135', '02136', '02137', '02138', '02139', '02140', '02141',
  '02142', '02143', '02144', '02145', '02148', '02149', '02150', '02151', '02152', '02153',
  '02155', '02163', '02171', '02184', '02196', '02199', '02201', '02203', '02204', '02205',
  '02206', '02210', '02211', '02212', '02215', '02217', '02222', '02228', '02238', '02241',
  '02266', '02283', '02284', '02293', '02295', '02297', '02298',
  // Atlanta, GA
  '30301', '30302', '30303', '30304', '30305', '30306', '30307', '30308', '30309', '30310',
  '30311', '30312', '30313', '30314', '30315', '30316', '30317', '30318', '30319', '30320',
  '30321', '30322', '30324', '30325', '30326', '30327', '30328', '30329', '30330', '30331',
  '30332', '30333', '30334', '30336', '30337', '30338', '30339', '30340', '30341', '30342',
  '30343', '30344', '30345', '30346', '30347', '30348', '30349', '30350', '30353', '30354',
  '30355', '30356', '30357', '30358', '30359', '30360', '30361', '30362', '30363', '30364',
  '30365', '30366', '30368', '30369', '30370', '30371', '30374', '30375', '30376', '30377',
  '30378', '30379', '30380', '30384', '30385', '30386', '30387', '30388', '30389', '30390',
  '30392', '30394', '30396', '30398', '30399',
  // Miami, FL
  '33101', '33102', '33109', '33111', '33112', '33114', '33116', '33119', '33122', '33124',
  '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132', '33133', '33134',
  '33135', '33136', '33137', '33138', '33139', '33140', '33141', '33142', '33143', '33144',
  '33145', '33146', '33147', '33149', '33150', '33151', '33152', '33153', '33154', '33155',
  '33156', '33157', '33158', '33159', '33160', '33161', '33162', '33163', '33164', '33165',
  '33166', '33167', '33168', '33169', '33170', '33172', '33173', '33174', '33175', '33176',
  '33177', '33178', '33179', '33180', '33181', '33182', '33183', '33184', '33185', '33186',
  '33187', '33188', '33189', '33190', '33193', '33194', '33195', '33196', '33197', '33198',
  '33199',
  // Detroit, MI
  '48201', '48202', '48203', '48204', '48205', '48206', '48207', '48208', '48209', '48210',
  '48211', '48212', '48213', '48214', '48215', '48216', '48217', '48218', '48219', '48220',
  '48221', '48222', '48223', '48224', '48225', '48226', '48227', '48228', '48229', '48230',
  '48231', '48232', '48233', '48234', '48235', '48236', '48237', '48238', '48239', '48240',
  '48242', '48243', '48244', '48255', '48260', '48264', '48265', '48266', '48267', '48268',
  '48269', '48272', '48275', '48277', '48278', '48279', '48288',
  // Additional major cities
  // Las Vegas, NV
  '89101', '89102', '89103', '89104', '89105', '89106', '89107', '89108', '89109', '89110',
  '89111', '89112', '89113', '89114', '89115', '89116', '89117', '89118', '89119', '89120',
  '89121', '89122', '89123', '89124', '89125', '89126', '89127', '89128', '89129', '89130',
  '89131', '89132', '89133', '89134', '89135', '89136', '89137', '89138', '89139', '89140',
  '89141', '89142', '89143', '89144', '89145', '89146', '89147', '89148', '89149', '89150',
  '89151', '89152', '89153', '89154', '89155', '89156', '89157', '89158', '89159', '89160',
  '89161', '89162', '89163', '89164', '89165', '89166', '89169', '89170', '89173', '89177',
  '89178', '89179', '89180', '89183', '89185', '89191', '89193', '89195', '89199',
  // Portland, OR
  '97201', '97202', '97203', '97204', '97205', '97206', '97207', '97208', '97209', '97210',
  '97211', '97212', '97213', '97214', '97215', '97216', '97217', '97218', '97219', '97220',
  '97221', '97222', '97223', '97224', '97225', '97227', '97228', '97229', '97230', '97231',
  '97232', '97233', '97236', '97238', '97239', '97240', '97242', '97251', '97253', '97254',
  '97256', '97258', '97266', '97267', '97268', '97269', '97280', '97281', '97282', '97283',
  '97286', '97290', '97291', '97292', '97293', '97294', '97296', '97298', '97299',
  // Nashville, TN
  '37201', '37202', '37203', '37204', '37205', '37206', '37207', '37208', '37209', '37210',
  '37211', '37212', '37213', '37214', '37215', '37216', '37217', '37218', '37219', '37220',
  '37221', '37222', '37224', '37227', '37228', '37229', '37230', '37232', '37234', '37235',
  '37236', '37237', '37238', '37240', '37241', '37242', '37243', '37244', '37246', '37250',
  // Baltimore, MD
  '21201', '21202', '21203', '21204', '21205', '21206', '21207', '21208', '21209', '21210',
  '21211', '21212', '21213', '21214', '21215', '21216', '21217', '21218', '21219', '21220',
  '21221', '21222', '21223', '21224', '21225', '21226', '21227', '21228', '21229', '21230',
  '21231', '21233', '21234', '21235', '21236', '21237', '21239', '21240', '21241', '21244',
  '21250', '21251', '21252', '21263', '21264', '21265', '21268', '21270', '21273', '21274',
  '21275', '21278', '21279', '21280', '21281', '21282', '21283', '21284', '21285', '21286',
  '21287', '21288', '21289', '21290', '21297', '21298',
  // Milwaukee, WI
  '53201', '53202', '53203', '53204', '53205', '53206', '53207', '53208', '53209', '53210',
  '53211', '53212', '53213', '53214', '53215', '53216', '53217', '53218', '53219', '53220',
  '53221', '53222', '53223', '53224', '53225', '53226', '53227', '53228', '53233', '53234',
  '53235', '53237', '53259', '53263', '53267', '53268', '53270', '53274', '53278', '53288',
  '53290', '53293', '53295',
  // Minneapolis, MN
  '55401', '55402', '55403', '55404', '55405', '55406', '55407', '55408', '55409', '55410',
  '55411', '55412', '55413', '55414', '55415', '55416', '55417', '55418', '55419', '55420',
  '55421', '55422', '55423', '55424', '55425', '55426', '55427', '55428', '55429', '55430',
  '55431', '55432', '55433', '55434', '55435', '55436', '55437', '55438', '55439', '55440',
  '55441', '55442', '55443', '55444', '55445', '55446', '55447', '55448', '55449', '55450',
  '55454', '55455', '55458', '55459', '55467', '55468', '55470', '55472', '55473', '55474',
  '55478', '55479', '55480', '55483', '55484', '55485', '55486', '55487', '55488',
  // Additional common zip codes from various states
  '10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000',
].sort();

export function AddressPicker({ value, onChange, label = 'Address' }: AddressPickerProps) {
  // Parse address value - handles both pipe-separated format and plain text
  const parseAddress = (addressString?: string) => {
    if (addressString) {
      // Check if it's in pipe-separated format
      if (addressString.includes('|')) {
        const parts = addressString.split('|');
        if (parts.length === 4) {
          return {
            street: parts[0] || '',
            city: parts[1] || '',
            state: parts[2] || '',
            zip: parts[3] || '',
          };
        }
      }
      // If it's old format (plain text), try to keep it as street address
      // User can then fill in the other fields
      return {
        street: addressString,
        city: '',
        state: '',
        zip: '',
      };
    }
    return { street: '', city: '', state: '', zip: '' };
  };

  const [address, setAddress] = useState(parseAddress(value));
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [zipSearch, setZipSearch] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Update when value prop changes
  useEffect(() => {
    const parsed = parseAddress(value);
    setAddress(parsed);
  }, [value]);

  const fetchAISuggestions = useCallback(async (currentAddress: typeof address) => {
    if (!isAIConfigured()) {
      return;
    }

    // Only fetch if user has entered meaningful data
    const hasInput = 
      (currentAddress.street && currentAddress.street.trim().length > 3) ||
      (currentAddress.city && currentAddress.city.trim().length > 2);

    if (!hasInput) {
      setAiSuggestions([]);
      setShowAISuggestions(false);
      return;
    }

    setLoadingAI(true);
    setShowAISuggestions(true); // Always show panel when fetching
    try {
      const suggestions = await getAIAddressSuggestions({
        street: currentAddress.street,
        city: currentAddress.city,
        state: currentAddress.state,
        zip: currentAddress.zip,
      });
      setAiSuggestions(suggestions);
      setShowAISuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Failed to fetch AI address suggestions:', error);
      setAiSuggestions([]);
      setShowAISuggestions(false);
    } finally {
      setLoadingAI(false);
    }
  }, []);

  const handleAddressChange = (field: 'street' | 'city' | 'state' | 'zip', newValue: string) => {
    const updated = { ...address, [field]: newValue };
    setAddress(updated);
    
    // Format as "street|city|state|zip" for storage
    const formatted = `${updated.street}|${updated.city}|${updated.state}|${updated.zip}`;
    onChange(formatted);

    // Debounce AI suggestions - wait 800ms after user stops typing
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      fetchAISuggestions(updated);
    }, 800);

    setDebounceTimer(timer);
  };

  const handleSelectAISuggestion = (suggestion: AddressSuggestion) => {
    setAddress({
      street: suggestion.street,
      city: suggestion.city,
      state: suggestion.state,
      zip: suggestion.zip,
    });
    const formatted = `${suggestion.street}|${suggestion.city}|${suggestion.state}|${suggestion.zip}`;
    onChange(formatted);
    setShowAISuggestions(false);
    setAiSuggestions([]);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const filteredCities = COMMON_CITIES.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredStates = US_STATES.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Filter real US zip codes
  const filteredZips = REAL_US_ZIP_CODES.filter(zip =>
    zip.includes(zipSearch)
  );

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1e40af">
        {label}
      </ThemedText>

      {/* Street Address */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
          Street Address
        </ThemedText>
        <TextInput
          style={styles.textInput}
          placeholder="Enter street address"
          placeholderTextColor="#8b95a7"
          value={address.street}
          onChangeText={(value) => handleAddressChange('street', value)}
        />
      </View>

      {/* City Dropdown */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
          City
        </ThemedText>
        <View style={styles.pickerButton}>
          <TextInput
            style={styles.pickerTextInput}
            placeholder="Enter or select city"
            placeholderTextColor="#8b95a7"
            value={address.city || ''}
            onChangeText={(value) => handleAddressChange('city', value)}
            editable={true}
            selectTextOnFocus={false}
          />
          <TouchableOpacity onPress={() => setShowCityModal(true)} style={styles.dropdownButton}>
            <Ionicons name="chevron-down" size={20} color="#4a5568" />
          </TouchableOpacity>
        </View>
      </View>

      {/* State Dropdown */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
          State
        </ThemedText>
        <View style={styles.pickerButton}>
          <TextInput
            style={styles.pickerTextInput}
            placeholder="Enter or select state"
            placeholderTextColor="#8b95a7"
            value={address.state || ''}
            onChangeText={(value) => handleAddressChange('state', value)}
            editable={true}
            selectTextOnFocus={false}
          />
          <TouchableOpacity onPress={() => setShowStateModal(true)} style={styles.dropdownButton}>
            <Ionicons name="chevron-down" size={20} color="#4a5568" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zip Code Dropdown */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
          Zip Code
        </ThemedText>
        <View style={styles.pickerButton}>
          <TextInput
            style={styles.pickerTextInput}
            placeholder="Enter or select zip code"
            placeholderTextColor="#8b95a7"
            value={address.zip || ''}
            onChangeText={(value) => handleAddressChange('zip', value)}
            keyboardType="numeric"
            editable={true}
            maxLength={5}
            selectTextOnFocus={false}
          />
          <TouchableOpacity onPress={() => setShowZipModal(true)} style={styles.dropdownButton}>
            <Ionicons name="chevron-down" size={20} color="#4a5568" />
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Address Suggestions - Auto-display when available */}
      {isAIConfigured() && (showAISuggestions || loadingAI || aiSuggestions.length > 0) && (
        <ThemedView style={styles.aiSuggestionsContainer}>
          <View style={styles.aiSuggestionsHeader}>
            <ThemedText type="defaultSemiBold" style={styles.aiSuggestionsTitle} lightColor="#1a1f2e">
              🤖 Possible Addresses
            </ThemedText>
            {!loadingAI && (
              <TouchableOpacity onPress={() => {
                setShowAISuggestions(false);
                setAiSuggestions([]);
              }}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          {loadingAI ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              <ThemedText style={styles.loadingText} lightColor="#6b7280">
                Finding matching addresses...
              </ThemedText>
            </View>
          ) : aiSuggestions.length > 0 ? (
            <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
              {aiSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectAISuggestion(suggestion)}
                >
                  <ThemedText type="defaultSemiBold" style={styles.suggestionText} lightColor="#1a1f2e">
                    {suggestion.fullAddress}
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={16} color="#2563eb" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
        </ThemedView>
      )}

      {/* City Modal */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select City
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              placeholderTextColor="#8b95a7"
              value={citySearch}
              onChangeText={setCitySearch}
            />
            <ScrollView style={styles.modalScrollView}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.modalItem,
                    address.city === city && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleAddressChange('city', city);
                    setCitySearch('');
                    setShowCityModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      address.city === city && styles.modalItemTextSelected,
                    ]}
                    lightColor={address.city === city ? '#ffffff' : '#1a1f2e'}
                  >
                    {city}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* State Modal */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select State
              </ThemedText>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search states..."
              placeholderTextColor="#8b95a7"
              value={stateSearch}
              onChangeText={setStateSearch}
            />
            <ScrollView style={styles.modalScrollView}>
              {filteredStates.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.modalItem,
                    address.state === state && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleAddressChange('state', state);
                    setStateSearch('');
                    setShowStateModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      address.state === state && styles.modalItemTextSelected,
                    ]}
                    lightColor={address.state === state ? '#ffffff' : '#1a1f2e'}
                  >
                    {state}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Zip Code Modal */}
      <Modal
        visible={showZipModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowZipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select Zip Code
              </ThemedText>
              <TouchableOpacity onPress={() => setShowZipModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search zip codes..."
              placeholderTextColor="#8b95a7"
              value={zipSearch}
              onChangeText={setZipSearch}
              keyboardType="numeric"
            />
            <ScrollView style={styles.modalScrollView}>
              {filteredZips.slice(0, 100).map((zip) => (
                <TouchableOpacity
                  key={zip}
                  style={[
                    styles.modalItem,
                    address.zip === zip && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleAddressChange('zip', zip);
                    setZipSearch('');
                    setShowZipModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      address.zip === zip && styles.modalItemTextSelected,
                    ]}
                    lightColor={address.zip === zip ? '#ffffff' : '#1a1f2e'}
                  >
                    {zip}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 8,
  },
  field: {
    gap: 8,
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 14,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  pickerTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
    padding: 0,
    minHeight: 20,
  },
  dropdownButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1f2e',
  },
  searchInput: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#1a1f2e',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemSelected: {
    backgroundColor: '#2563eb',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  aiSuggestionsContainer: {
    marginTop: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bae6fd',
    padding: 12,
    maxHeight: 200,
  },
  aiSuggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1f2e',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});

