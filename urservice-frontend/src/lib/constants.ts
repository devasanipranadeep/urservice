export interface SubCategory {
  id: string;
  name: string;
}

export interface MainCategory {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export const SERVICE_CATEGORIES: MainCategory[] = [
  {
    id: 'education',
    name: 'Education',
    subCategories: [
      { id: 'home_tutors', name: 'Home Tutors' },
      { id: 'online_tutors', name: 'Online Tutors' },
      { id: 'school_tutors', name: 'School Tutors' },
      { id: 'college_tutors', name: 'College Tutors' },
      { id: 'competitive_exam_coaching', name: 'Competitive Exam Coaching' },
      { id: 'spoken_english', name: 'Spoken English' },
      { id: 'computer_courses', name: 'Computer Courses' },
      { id: 'music_classes', name: 'Music Classes' },
      { id: 'dance_classes', name: 'Dance Classes' },
      { id: 'yoga_classes', name: 'Yoga Classes' },
      { id: 'art_craft_classes', name: 'Art & Craft Classes' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    subCategories: [
      { id: 'doctor_appointments', name: 'Doctor Appointments' },
      { id: 'dentist_appointments', name: 'Dentist Appointments' },
      { id: 'physiotherapy', name: 'Physiotherapy' },
      { id: 'diagnostic_labs', name: 'Diagnostic Labs' },
      { id: 'home_nursing', name: 'Home Nursing' },
      { id: 'vaccination_services', name: 'Vaccination Services' },
      { id: 'mental_health_counseling', name: 'Mental Health Counseling' },
      { id: 'nutrition_diet_consultation', name: 'Nutrition & Diet Consultation' },
      { id: 'pharmacy_ordering', name: 'Pharmacy Ordering' },
      { id: 'ambulance_services', name: 'Ambulance Services' },
    ],
  },
  {
    id: 'beauty_salon',
    name: 'Beauty & Salon',
    subCategories: [
      { id: 'haircut', name: 'Haircut' },
      { id: 'hair_styling', name: 'Hair Styling' },
      { id: 'hair_coloring', name: 'Hair Coloring' },
      { id: 'facial', name: 'Facial' },
      { id: 'cleanup', name: 'Cleanup' },
      { id: 'waxing', name: 'Waxing' },
      { id: 'threading', name: 'Threading' },
      { id: 'manicure', name: 'Manicure' },
      { id: 'pedicure', name: 'Pedicure' },
      { id: 'bridal_makeup', name: 'Bridal Makeup' },
      { id: 'groom_makeup', name: 'Groom Makeup' },
      { id: 'massage', name: 'Massage' },
      { id: 'spa', name: 'Spa' },
      { id: 'beard_grooming', name: 'Beard Grooming' },
      { id: 'skin_treatments', name: 'Skin Treatments' },
    ],
  },
  {
    id: 'home_services',
    name: 'Home Services',
    subCategories: [
      { id: 'electrician', name: 'Electrician' },
      { id: 'plumber', name: 'Plumber' },
      { id: 'carpenter', name: 'Carpenter' },
      { id: 'ac_repair', name: 'AC Repair' },
      { id: 'refrigerator_repair', name: 'Refrigerator Repair' },
      { id: 'washing_machine_repair', name: 'Washing Machine Repair' },
      { id: 'tv_repair', name: 'TV Repair' },
      { id: 'ro_water_purifier_service', name: 'RO Water Purifier Service' },
      { id: 'painter', name: 'Painter' },
      { id: 'pest_control', name: 'Pest Control' },
      { id: 'cctv_installation', name: 'CCTV Installation' },
      { id: 'appliance_repair', name: 'Appliance Repair' },
    ],
  },
  {
    id: 'cleaning_services',
    name: 'Cleaning Services',
    subCategories: [
      { id: 'house_cleaning', name: 'House Cleaning' },
      { id: 'deep_cleaning', name: 'Deep Cleaning' },
      { id: 'bathroom_cleaning', name: 'Bathroom Cleaning' },
      { id: 'kitchen_cleaning', name: 'Kitchen Cleaning' },
      { id: 'sofa_cleaning', name: 'Sofa Cleaning' },
      { id: 'carpet_cleaning', name: 'Carpet Cleaning' },
      { id: 'water_tank_cleaning', name: 'Water Tank Cleaning' },
      { id: 'office_cleaning', name: 'Office Cleaning' },
    ],
  },
  {
    id: 'vehicle_services',
    name: 'Vehicle Services',
    subCategories: [
      { id: 'car_wash', name: 'Car Wash' },
      { id: 'bike_wash', name: 'Bike Wash' },
      { id: 'car_repair', name: 'Car Repair' },
      { id: 'bike_repair', name: 'Bike Repair' },
      { id: 'tyre_replacement', name: 'Tyre Replacement' },
      { id: 'battery_replacement', name: 'Battery Replacement' },
      { id: 'roadside_assistance', name: 'Roadside Assistance' },
      { id: 'vehicle_inspection', name: 'Vehicle Inspection' },
    ],
  },
  {
    id: 'event_services',
    name: 'Event Services',
    subCategories: [
      { id: 'photography', name: 'Photography' },
      { id: 'videography', name: 'Videography' },
      { id: 'catering', name: 'Catering' },
      { id: 'decoration', name: 'Decoration' },
      { id: 'dj_services', name: 'DJ Services' },
      { id: 'event_planner', name: 'Event Planner' },
      { id: 'mehendi_artist', name: 'Mehendi Artist' },
      { id: 'makeup_artist', name: 'Makeup Artist' },
      { id: 'live_music', name: 'Live Music' },
      { id: 'cook', name: 'Cook' },
    ],
  },
  {
    id: 'repair_services',
    name: 'Repair Services',
    subCategories: [
      { id: 'mobile_repair', name: 'Mobile Repair' },
      { id: 'laptop_repair', name: 'Laptop Repair' },
      { id: 'computer_repair', name: 'Computer Repair' },
      { id: 'printer_repair', name: 'Printer Repair' },
      { id: 'cctv_repair', name: 'CCTV Repair' },
      { id: 'smart_tv_repair', name: 'Smart TV Repair' },
    ],
  },
  {
    id: 'rental_services',
    name: 'Rental Services',
    subCategories: [
      { id: 'bike_rental', name: 'Bike Rental' },
      { id: 'car_rental', name: 'Car Rental' },
      { id: 'furniture_rental', name: 'Furniture Rental' },
      { id: 'camera_rental', name: 'Camera Rental' },
      { id: 'party_equipment_rental', name: 'Party Equipment Rental' },
      { id: 'car_driver', name: 'Car Driver' },
    ],
  },
];
