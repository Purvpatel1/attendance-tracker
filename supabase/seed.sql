-- ========================================================
-- ATTENDANCE TRACKER V2 - CANONICAL SEED DATA
-- Populates public.subjects and public.timetable_slots from timetableData.js
-- ========================================================

-- --------------------------------------------------------
-- 1. SUBJECTS SEED DATA
-- --------------------------------------------------------

-- Branch: Computer Engineering (CE)
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('ac26f502-1f4f-443e-8816-c1827d8758e4', 'Computer Engineering (CE)', 'ALL', '26AF1245PC501', 'Machine Learning', 'Lecture', 'Prof. Sureshsingh Rajpurohit')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('be52e8b0-be11-41be-841b-db404f34cd09', 'Computer Engineering (CE)', 'ALL', '26AF1245PCL508', 'Machine Learning Laboratory', 'Lab', 'Prof. Sureshsingh Rajpurohit')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('5e76ac9a-15eb-498c-8252-a3cd90bb024f', 'Computer Engineering (CE)', 'ALL', '26AF1245PC502', 'Theory of Computations', 'Lecture', 'Prof. Shridhar Iyer')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('199d3325-9ff2-49a8-8d98-65d8c914d933', 'Computer Engineering (CE)', 'ALL', '26AF1245PC503', 'Operating System', 'Lecture', 'Prof. Swapna Ambekar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('a7c58b6b-85ae-4a12-8b18-32d18e4c65da', 'Computer Engineering (CE)', 'ALL', '26AF1245PCL509', 'Operating System Laboratory', 'Lab', 'Prof. Swapna Ambekar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('ac6094de-e83c-40eb-836f-a2064c333ff0', 'Computer Engineering (CE)', 'ALL', '26AF1245PC504', 'Database Management System', 'Lecture', 'Prof. Apurva Joshi')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('75faf613-6bac-4e4c-8963-43f0111b85bb', 'Computer Engineering (CE)', 'ALL', '26AF1245PCL510', 'Database Management System Laboratory', 'Lab', 'Prof. Apurva Joshi')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('374cbba1-8519-4cde-808e-ff1c6d3941f7', 'Computer Engineering (CE)', 'ALL', '26AF1245PE505', 'Entrepreneurship Skills and Digital Marketing Strategies', 'Lecture', 'Prof. Anju Tailor')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('e881728f-851b-4c04-8aa5-6c61cf7075d5', 'Computer Engineering (CE)', 'ALL', '26AF1245MD506', 'Foundation of Quantum Computing', 'Lecture', 'Prof. Pramod Bide')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('57d9f615-3510-4472-83e5-0e2d176c1168', 'Computer Engineering (CE)', 'ALL', '26AF1000OE507', 'Computer Graphics', 'Lecture', 'Prof. Shahista Agwan')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('591b2284-e68f-4ca5-8897-df3f928d37b5', 'Computer Engineering (CE)', 'ALL', '25AF1245SEM511', 'Seminar & Mini Project', 'Seminar', 'Prof. Apurva Joshi / Prof. Sureshsingh Rajpurohit')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;

-- Branch: Computer Science & Engineering (CSE)
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('19b0d3d7-b39d-42c4-89f9-11ea7a903720', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245PC501', 'Machine Learning', 'Lecture', 'Prof. Sureshsingh Rajpurohit')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('cf82a6f1-300d-4e09-80d9-e77cb90afad1', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245PCL508', 'Machine Learning Laboratory', 'Lab', 'Prof. Sureshsingh Rajpurohit')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('1eec5a2d-3829-4c65-85aa-b368e4d15589', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245PC502', 'Theory of Computations', 'Lecture', 'Prof. Shridhar Iyer')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('0a7faec9-c945-4350-87a9-4b055f446f31', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245PC503', 'Operating System', 'Lecture', 'Prof. Swapna Ambekar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('60074cf4-41cb-4480-834c-3134b7098433', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245PCL509', 'Operating System Laboratory', 'Lab', 'Prof. Swapna Ambekar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('cb8f5b2e-ae05-4dfd-8097-5045a7acf122', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245PC504', 'Database Management System', 'Lecture', 'Prof. Apurva Joshi')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('0c379498-5c80-45ee-81c0-091f20820f08', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245PCL510', 'Database Management System Laboratory', 'Lab', 'Prof. Apurva Joshi')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('ba072626-5606-4d50-89b4-4ddafee6333d', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245PE505', 'Entrepreneurship Skills and Digital Marketing Strategies', 'Lecture', 'Prof. Anju Tailor')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('371eae0a-146c-4d93-818d-aba58d763d8e', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1245MD506', 'Foundation of Quantum Computing', 'Lecture', 'Prof. Pramod Bide')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('34896f50-a7fe-47ed-87ab-f6a1fbc4464e', 'Computer Science & Engineering (CSE)', 'ALL', '26AF1000OE507', 'Computer Graphics', 'Lecture', 'Prof. Shahista Agwan')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('296863dc-707d-4f1c-82c4-c8c46b8fe0bf', 'Computer Science & Engineering (CSE)', 'ALL', '25AF1245SEM511', 'Seminar & Mini Project', 'Seminar', 'Prof. Aditi Malkar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;

-- Branch: Computer Science Engineering-AIML (AIML)
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('e14e68ac-5f2c-48b1-8d28-9ae944803220', 'Computer Science Engineering-AIML (AIML)', 'ALL', '26AF1245PC501', 'Machine Learning', 'Lecture', 'Prof. Shruti Mathur')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('9d94938b-dee9-4954-8009-cee2aa961a3e', 'Computer Science Engineering-AIML (AIML)', 'ALL', '26AF1245PCL508', 'Machine Learning Laboratory', 'Lab', 'Mr. Wellborn Bar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('dcb683b5-bc60-4eef-8178-df7db57e2b45', 'Computer Science Engineering-AIML (AIML)', 'ALL', '26AFAIPC502', 'Object Oriented Programming in Java', 'Lecture', 'Prof. Jarna Nagpal')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('cc30ee59-c9f1-4527-890f-8b7fe8772a7f', 'Computer Science Engineering-AIML (AIML)', 'ALL', '26AFAIPC503', 'Cloud and Distributed AI Systems', 'Lecture', 'Prof. Avina Devadiga')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('bb32661a-bc06-46c6-81bd-4731db4002a7', 'Computer Science Engineering-AIML (AIML)', 'ALL', '26AFAIPC504', 'Data Engineering and Big Data Systems', 'Lecture', 'Prof. Prashant Islur')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('612a6255-47ae-475c-8837-dad9ceac228d', 'Computer Science Engineering-AIML (AIML)', 'ALL', '26AF1XXXOEM505X', 'Entrepreneurship Skills and Digital Marketing Strategies', 'Lecture', 'Prof. Jugnu Manhas')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('9ace62e4-414e-4a25-8e70-9341ea8f16a9', 'Computer Science Engineering-AIML (AIML)', 'ALL', '25AF1245MD506B', 'Database Management System', 'Lecture', 'Prof. Aditi Malkar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('3003fa84-0770-4208-8d55-55ce3c2298cd', 'Computer Science Engineering-AIML (AIML)', 'ALL', '25AF1245MDL506B', 'Database Management Systems Laboratory', 'Lab', 'Prof. Aditi Malkar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('b6ed0e9c-3191-4fe2-8782-66404013f29f', 'Computer Science Engineering-AIML (AIML)', 'ALL', '26AFAIPE507C', 'AI for Cybersecurity', 'Lecture', 'Prof. Shahista Agwan')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('16e19bb9-d8bd-45d5-81af-a0e29335038e', 'Computer Science Engineering-AIML (AIML)', 'ALL', '26AFAIPCL509', 'MLOps Laboratory', 'Lab', 'Prof. Raj Gohil')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('0c5b48f0-12cf-4d7a-836f-07c6f28c6fbe', 'Computer Science Engineering-AIML (AIML)', 'ALL', '25AFAISEM511', 'Seminar and Mini Project', 'Seminar', 'Prof. Swapna Ambekar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;

-- Branch: Information Technology (IT)
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('d4b3b76d-214b-4ba4-8211-3f745bfea174', 'Information Technology (IT)', 'ALL', '26AF1246PC501', 'Operating System', 'Lecture', 'Prof. Chinmay Raut')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('3157bbd3-88c4-4f60-86a9-af0b1ce9ab8e', 'Information Technology (IT)', 'ALL', '26AF1246PCL502', 'Operating System Laboratory', 'Lab', 'Prof. Farhan Shaikh')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('358c360c-1587-4218-8cbb-d17d339fbfe5', 'Information Technology (IT)', 'ALL', '26AF1246PC503', 'Database Management Systems', 'Lecture', 'Prof. Aditi Malkar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('184f03f2-dcad-4a62-865d-cd6ddfbcd1be', 'Information Technology (IT)', 'ALL', '26AF1246PCL504', 'Database Management Systems Lab', 'Lab', 'Prof. Aditi Malkar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('e2710ff5-e9c0-4e4f-89b5-013d45401aec', 'Information Technology (IT)', 'ALL', '26AF1246PC505', 'Compiler Design', 'Lecture', 'Dr. Amol Joglekar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('2e8bf13e-257c-48a8-8fb4-c93009b38920', 'Information Technology (IT)', 'ALL', '26AFAIMD506A', 'Minor Machine Learning', 'Lecture', 'Prof. Nilesh Patil')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('52868744-61b0-4039-81d8-e58cbb8793e4', 'Information Technology (IT)', 'ALL', '26AFAIMD506LA', 'Minor Machine Learning Lab', 'Lab', 'Mr. Welborn Bar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('270c6415-f40d-4c57-864c-efba88d5dad1', 'Information Technology (IT)', 'ALL', '25AF1MACOEMO5(X)', 'Entrepreneurship Skills and Digital Marketing Strategies', 'Lecture', 'Prof. Jignu Manhas')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('4206b895-a613-4260-8fd5-3326919ceda3', 'Information Technology (IT)', 'ALL', '26AF1246PE508A', 'Data Science and Visualization', 'Lecture', 'Prof. Sneha Valia')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('0ea18d76-50db-418f-870d-22eebbfc57d3', 'Information Technology (IT)', 'ALL', '26AF1246PEL509A', 'Data Science and Visualization with Python Lab', 'Lab', 'Prof. Sneha Valia')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;
INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)
VALUES ('e4fd9c25-b114-4c83-81fc-666835c8a03c', 'Information Technology (IT)', 'ALL', '26AF1246ELC510', 'Mini Project', 'Project', 'Prof. Sureshsingh Rajpurohit')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;

-- --------------------------------------------------------
-- 2. TIMETABLE SLOTS SEED DATA
-- --------------------------------------------------------

-- Branch: Computer Engineering (CE)
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('8e5ae7e2-89c4-4079-8b91-88c6c2643d42', 'Computer Engineering (CE)', 'ALL', 1, '08:00:00', '09:00:00', '57d9f615-3510-4472-83e5-0e2d176c1168', 'UB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('77fae703-3a4f-4ff8-8a65-508f46e303fd', 'Computer Engineering (CE)', 'ALL', 1, '09:00:00', '10:00:00', '57d9f615-3510-4472-83e5-0e2d176c1168', 'UB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('fc0c1ba5-d704-4a20-8190-69221a60c9c0', 'Computer Engineering (CE)', 'ALL', 1, '10:00:00', '11:00:00', '199d3325-9ff2-49a8-8d98-65d8c914d933', 'UB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('afe97ed8-9d9a-4174-8587-8e26376dc7b2', 'Computer Engineering (CE)', 'ALL', 1, '11:00:00', '12:00:00', 'ac26f502-1f4f-443e-8816-c1827d8758e4', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('8e90974b-b941-4cc8-8556-ef0f46a40dd8', 'Computer Engineering (CE)', 'ALL', 1, '13:00:00', '14:00:00', '199d3325-9ff2-49a8-8d98-65d8c914d933', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('fe5d0c54-cfd6-4f4b-8ba9-87c44e3dbbe7', 'Computer Engineering (CE)', 'ALL', 2, '08:00:00', '09:00:00', 'e881728f-851b-4c04-8aa5-6c61cf7075d5', 'CR202')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('bd5c54e8-8f4f-4874-8c3c-b90c4fc87f25', 'Computer Engineering (CE)', 'ALL', 2, '09:00:00', '10:00:00', 'e881728f-851b-4c04-8aa5-6c61cf7075d5', 'CR202')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('f7df1531-0fd8-49f0-8cd1-b765916b080f', 'Computer Engineering (CE)', 'ALL', 2, '10:00:00', '11:00:00', 'ac6094de-e83c-40eb-836f-a2064c333ff0', 'CR202')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('163c209e-cc2a-4f3c-8588-cb25d0c5271d', 'Computer Engineering (CE)', 'ALL', 2, '11:00:00', '12:00:00', '5e76ac9a-15eb-498c-8252-a3cd90bb024f', 'CR202')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('d682e070-919c-4a0b-8c86-fae97cb166a7', 'Computer Engineering (CE)', 'CE1', 2, '14:00:00', '16:00:00', 'be52e8b0-be11-41be-841b-db404f34cd09', 'ROBOTICS LAB 6TH FLOOR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('9da196ff-22bd-4a78-8487-b3822300cf83', 'Computer Engineering (CE)', 'ALL', 3, '08:00:00', '09:00:00', '374cbba1-8519-4cde-808e-ff1c6d3941f7', 'UB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('67610b10-cd32-4374-8f70-6e7b0791d100', 'Computer Engineering (CE)', 'ALL', 3, '09:00:00', '10:00:00', 'ac26f502-1f4f-443e-8816-c1827d8758e4', 'UB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('85797cd0-3dbf-4d5d-849d-544aa3157f68', 'Computer Engineering (CE)', 'ALL', 3, '10:00:00', '11:00:00', 'ac6094de-e83c-40eb-836f-a2064c333ff0', 'UB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('61062bf7-8148-48b3-8b6b-045b1866e179', 'Computer Engineering (CE)', 'CE1', 3, '12:00:00', '14:00:00', '75faf613-6bac-4e4c-8963-43f0111b85bb', 'DBMSL CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('a831eb1d-9a88-40ed-8e83-e0a44f3a3913', 'Computer Engineering (CE)', 'CE2', 3, '12:00:00', '14:00:00', 'be52e8b0-be11-41be-841b-db404f34cd09', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('aa01cd73-291f-44c4-8fa2-42f252c0ff51', 'Computer Engineering (CE)', 'CE2', 3, '14:00:00', '16:00:00', 'a7c58b6b-85ae-4a12-8b18-32d18e4c65da', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('5f2a7b33-733f-4072-88df-e0a458fc9e9d', 'Computer Engineering (CE)', 'ALL', 4, '08:00:00', '09:00:00', '199d3325-9ff2-49a8-8d98-65d8c914d933', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('b0f2ddae-07c8-4fed-898f-8523c0dcaa86', 'Computer Engineering (CE)', 'ALL', 4, '09:00:00', '10:00:00', 'e881728f-851b-4c04-8aa5-6c61cf7075d5', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('0cc70204-cd93-4f19-8505-a99b1303efde', 'Computer Engineering (CE)', 'ALL', 4, '10:00:00', '11:00:00', '57d9f615-3510-4472-83e5-0e2d176c1168', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('13e884c4-7cc8-4cf0-85b4-8050bb600fd8', 'Computer Engineering (CE)', 'ALL', 4, '11:00:00', '12:00:00', 'ac6094de-e83c-40eb-836f-a2064c333ff0', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('aa44e9a7-b381-46ea-82d3-0608bc3562d1', 'Computer Engineering (CE)', 'CE1', 4, '12:00:00', '14:00:00', 'a7c58b6b-85ae-4a12-8b18-32d18e4c65da', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('193c9362-3a08-416c-8aef-fa1889ebe002', 'Computer Engineering (CE)', 'ALL', 4, '13:00:00', '14:00:00', 'ac26f502-1f4f-443e-8816-c1827d8758e4', 'CR2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('e5fd4aa4-090f-46ef-818a-7d4eec681a97', 'Computer Engineering (CE)', 'ALL', 4, '14:00:00', '17:00:00', '374cbba1-8519-4cde-808e-ff1c6d3941f7', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('3cb86829-c1e9-4fe2-87cb-135574d0e0a5', 'Computer Engineering (CE)', 'CE2', 5, '12:00:00', '14:00:00', '75faf613-6bac-4e4c-8963-43f0111b85bb', 'DBMSL CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('21606864-910f-4ca8-8c9c-89a1db262df1', 'Computer Engineering (CE)', 'CE1', 5, '12:00:00', '14:00:00', 'a7c58b6b-85ae-4a12-8b18-32d18e4c65da', 'OSL CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('9fc433b6-e6f7-4226-840e-931fd1a4a24c', 'Computer Engineering (CE)', 'ALL', 5, '14:00:00', '16:00:00', '5e76ac9a-15eb-498c-8252-a3cd90bb024f', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('4179a325-c45f-4a5f-80b3-aba2b0b16fff', 'Computer Engineering (CE)', 'CE1', 6, '10:00:00', '12:00:00', '591b2284-e68f-4ca5-8897-df3f928d37b5', 'SEMINAR CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('f00af181-718e-4a19-8ba4-48347d2a9456', 'Computer Engineering (CE)', 'CE2', 6, '10:00:00', '12:00:00', '591b2284-e68f-4ca5-8897-df3f928d37b5', 'SEMINAR CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('dac2d156-ae16-4539-8ec4-15ca964da607', 'Computer Engineering (CE)', 'CE1', 6, '12:00:00', '14:00:00', '591b2284-e68f-4ca5-8897-df3f928d37b5', 'SEMINAR CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('321c7d31-67a6-407e-8851-c004b96627d0', 'Computer Engineering (CE)', 'CE2', 6, '12:00:00', '14:00:00', '591b2284-e68f-4ca5-8897-df3f928d37b5', 'SEMINAR CC1')
ON CONFLICT (id) DO NOTHING;

-- Branch: Computer Science & Engineering (CSE)
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('9c6495fe-2f11-45cf-8314-232a610643e2', 'Computer Science & Engineering (CSE)', 'ALL', 1, '08:00:00', '10:00:00', '371eae0a-146c-4d93-818d-aba58d763d8e', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('d6208e62-2116-467f-8be0-3fde0edb767e', 'Computer Science & Engineering (CSE)', 'ALL', 1, '10:00:00', '11:00:00', '19b0d3d7-b39d-42c4-89f9-11ea7a903720', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('9ad5f0ec-3f5a-485e-8af3-a3df0196a656', 'Computer Science & Engineering (CSE)', 'CSE2', 1, '12:00:00', '14:00:00', 'cf82a6f1-300d-4e09-80d9-e77cb90afad1', 'LAB-IV 5TH FLOOR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('761a37d5-6fdb-44b5-8be5-ba795d9fca02', 'Computer Science & Engineering (CSE)', 'CSE1', 1, '12:00:00', '14:00:00', '60074cf4-41cb-4480-834c-3134b7098433', 'HW LAB 3RD FLOOR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('68eb93b1-be29-443a-84d8-6d5431471c9d', 'Computer Science & Engineering (CSE)', 'ALL', 1, '14:00:00', '16:00:00', '1eec5a2d-3829-4c65-85aa-b368e4d15589', 'CR2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('a27fffdc-ca32-41cc-8e06-b92c1a1ce020', 'Computer Science & Engineering (CSE)', 'ALL', 2, '10:00:00', '11:00:00', '0a7faec9-c945-4350-87a9-4b055f446f31', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('2424dbb5-ce5e-4563-8447-63abb292332b', 'Computer Science & Engineering (CSE)', 'CSE1', 2, '11:00:00', '13:00:00', 'cf82a6f1-300d-4e09-80d9-e77cb90afad1', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('07354e19-25e0-4268-81ed-f1a3c45787ea', 'Computer Science & Engineering (CSE)', 'ALL', 2, '14:00:00', '16:00:00', '34896f50-a7fe-47ed-87ab-f6a1fbc4464e', 'CR2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('9e44b6d1-5d4e-4624-8866-2813ef68a47d', 'Computer Science & Engineering (CSE)', 'CSE1', 3, '08:00:00', '10:00:00', '0c379498-5c80-45ee-81c0-091f20820f08', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('2a680d2a-f88c-4a1d-80f3-bb7704c48858', 'Computer Science & Engineering (CSE)', 'CSE2', 3, '08:00:00', '10:00:00', '60074cf4-41cb-4480-834c-3134b7098433', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('3f035c86-3ab8-45d3-8187-298b7d373d2b', 'Computer Science & Engineering (CSE)', 'ALL', 3, '10:00:00', '12:00:00', 'cb8f5b2e-ae05-4dfd-8097-5045a7acf122', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('628ea6eb-1fee-4671-87b5-ab40c1506750', 'Computer Science & Engineering (CSE)', 'CSE2', 3, '11:00:00', '13:00:00', '0c379498-5c80-45ee-81c0-091f20820f08', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('5e7e425a-6b4e-47bd-8de5-972199ff6d0a', 'Computer Science & Engineering (CSE)', 'ALL', 3, '14:00:00', '16:00:00', 'ba072626-5606-4d50-89b4-4ddafee6333d', 'CR-24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('3fe301de-d36d-4cf6-8f11-1731dd6fb141', 'Computer Science & Engineering (CSE)', 'ALL', 4, '08:00:00', '09:00:00', '371eae0a-146c-4d93-818d-aba58d763d8e', 'CR202')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('0548a036-67ab-4ad4-887c-0b7213585e06', 'Computer Science & Engineering (CSE)', 'ALL', 4, '09:00:00', '10:00:00', '0a7faec9-c945-4350-87a9-4b055f446f31', 'CR202')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('a0e59d87-1927-4978-8ab1-4ee5081364c2', 'Computer Science & Engineering (CSE)', 'ALL', 4, '10:00:00', '11:00:00', '19b0d3d7-b39d-42c4-89f9-11ea7a903720', 'CR202')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('883a09e5-b456-4deb-8d63-5e254f4b9471', 'Computer Science & Engineering (CSE)', 'ALL', 4, '11:00:00', '12:00:00', '34896f50-a7fe-47ed-87ab-f6a1fbc4464e', 'CR202')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('87e84879-ebc3-4e22-8634-e2bc95875b51', 'Computer Science & Engineering (CSE)', 'ALL', 5, '10:00:00', '11:00:00', '1eec5a2d-3829-4c65-85aa-b368e4d15589', 'UB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('71482b55-702c-4a3e-8407-d5babde642a5', 'Computer Science & Engineering (CSE)', 'ALL', 5, '11:00:00', '12:00:00', '0a7faec9-c945-4350-87a9-4b055f446f31', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('cf830fb0-efe3-4190-85e5-ef53109870e2', 'Computer Science & Engineering (CSE)', 'ALL', 5, '13:00:00', '14:00:00', '19b0d3d7-b39d-42c4-89f9-11ea7a903720', 'CR2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('50a79a37-2a47-464d-8882-c1856b92e206', 'Computer Science & Engineering (CSE)', 'ALL', 5, '14:00:00', '15:00:00', 'cb8f5b2e-ae05-4dfd-8097-5045a7acf122', 'CR2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('6b782345-2276-48b6-8179-209d60c68c09', 'Computer Science & Engineering (CSE)', 'ALL', 5, '15:00:00', '17:00:00', 'ba072626-5606-4d50-89b4-4ddafee6333d', 'CR2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('2653c5cf-1aba-4105-89c5-1042d622c0d7', 'Computer Science & Engineering (CSE)', 'ALL', 6, '08:00:00', '12:00:00', '296863dc-707d-4f1c-82c4-c8c46b8fe0bf', 'SEMINAR CC1')
ON CONFLICT (id) DO NOTHING;

-- Branch: Computer Science Engineering-AIML (AIML)
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('68bede85-d771-4728-8eba-bbcd7d157eb0', 'Computer Science Engineering-AIML (AIML)', 'AM1', 1, '08:00:00', '10:00:00', '3003fa84-0770-4208-8d55-55ce3c2298cd', 'DBMSL CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('c2ce7151-0228-4bf1-8d7f-113f17876e27', 'Computer Science Engineering-AIML (AIML)', 'AM2', 1, '08:00:00', '10:00:00', '16e19bb9-d8bd-45d5-81af-a0e29335038e', 'MLOps CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('1de43c08-6475-4867-8b9f-c312e864dc86', 'Computer Science Engineering-AIML (AIML)', 'ALL', 1, '10:00:00', '11:00:00', 'e14e68ac-5f2c-48b1-8d28-9ae944803220', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('e69a23cc-bf94-4830-8df6-81bef93c8d85', 'Computer Science Engineering-AIML (AIML)', 'ALL', 1, '12:00:00', '14:00:00', 'b6ed0e9c-3191-4fe2-8782-66404013f29f', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('f178a094-f560-43cd-8141-0dd84c4f8bc0', 'Computer Science Engineering-AIML (AIML)', 'ALL', 1, '14:00:00', '15:00:00', 'cc30ee59-c9f1-4527-890f-8b7fe8772a7f', 'CR-24B 6TH FLOOR SBM')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('95edfe4d-b21b-4a3c-892c-9bc1ca5cd3be', 'Computer Science Engineering-AIML (AIML)', 'ALL', 2, '08:00:00', '10:00:00', '9ace62e4-414e-4a25-8e70-9341ea8f16a9', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('7009c194-af52-48d1-83a3-0da16ec203f5', 'Computer Science Engineering-AIML (AIML)', 'ALL', 2, '10:00:00', '11:00:00', 'e14e68ac-5f2c-48b1-8d28-9ae944803220', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('0f216c0d-48d5-49a5-8a05-3c0dc3057373', 'Computer Science Engineering-AIML (AIML)', 'ALL', 2, '11:00:00', '12:00:00', 'dcb683b5-bc60-4eef-8178-df7db57e2b45', 'CR-24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('fa583781-826d-479f-8b1f-ce37e5ee6da8', 'Computer Science Engineering-AIML (AIML)', 'AM1', 2, '12:00:00', '14:00:00', '9d94938b-dee9-4954-8009-cee2aa961a3e', 'LAB-V 5TH FLOOR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('5c6cb4d7-832d-4f84-82aa-82e84173a2fd', 'Computer Science Engineering-AIML (AIML)', 'AM2', 2, '12:00:00', '14:00:00', '3003fa84-0770-4208-8d55-55ce3c2298cd', 'LAB-VI 5TH FLOOR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('5a823aef-7c51-4f85-8af1-62a33e593d97', 'Computer Science Engineering-AIML (AIML)', 'AM1', 3, '07:30:00', '09:30:00', '16e19bb9-d8bd-45d5-81af-a0e29335038e', 'LAB 3RD FLOOR ENV LAB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('e828602d-afe9-4d30-808a-a7cecdc5c640', 'Computer Science Engineering-AIML (AIML)', 'ALL', 3, '10:00:00', '12:00:00', 'cc30ee59-c9f1-4527-890f-8b7fe8772a7f', 'CR 24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('7ad400d3-3473-422a-85da-0146632d593c', 'Computer Science Engineering-AIML (AIML)', 'ALL', 3, '13:00:00', '15:00:00', 'bb32661a-bc06-46c6-81bd-4731db4002a7', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('1b2f3f7c-13a1-42b6-8585-35d47123a2e7', 'Computer Science Engineering-AIML (AIML)', 'ALL', 4, '08:00:00', '10:00:00', '612a6255-47ae-475c-8837-dad9ceac228d', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('6f18bd2a-e906-461e-8cb7-ee66283c345f', 'Computer Science Engineering-AIML (AIML)', 'ALL', 4, '10:00:00', '12:00:00', 'dcb683b5-bc60-4eef-8178-df7db57e2b45', 'CR-24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('33527864-1ddb-403e-88df-8b6937418f54', 'Computer Science Engineering-AIML (AIML)', 'ALL', 4, '13:00:00', '14:00:00', '9ace62e4-414e-4a25-8e70-9341ea8f16a9', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('7c77823a-7f10-480a-83ea-6238bf92c610', 'Computer Science Engineering-AIML (AIML)', 'ALL', 4, '14:00:00', '15:00:00', 'b6ed0e9c-3191-4fe2-8782-66404013f29f', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('7dcd8739-9016-47ab-89be-60ee6af6e26d', 'Computer Science Engineering-AIML (AIML)', 'ALL', 4, '15:00:00', '16:00:00', 'bb32661a-bc06-46c6-81bd-4731db4002a7', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('47534b99-c70c-482c-84e2-d4c0a2b9a4f1', 'Computer Science Engineering-AIML (AIML)', 'ALL', 5, '08:00:00', '10:00:00', '612a6255-47ae-475c-8837-dad9ceac228d', 'CR-24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('6aebb64a-d89f-4133-8d9e-5d85a4cda599', 'Computer Science Engineering-AIML (AIML)', 'ALL', 5, '10:00:00', '11:00:00', 'e14e68ac-5f2c-48b1-8d28-9ae944803220', '24B SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('c2864b2a-7e67-41e3-8f95-a21a62800824', 'Computer Science Engineering-AIML (AIML)', 'AM2', 5, '12:00:00', '14:00:00', '9d94938b-dee9-4954-8009-cee2aa961a3e', 'LAB-VI 5TH FLR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('f556d46e-93e3-4d20-8b26-97b5c3c49646', 'Computer Science Engineering-AIML (AIML)', 'ALL', 6, '08:00:00', '10:00:00', '16e19bb9-d8bd-45d5-81af-a0e29335038e', '24B 6TH FLOOR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('bfe12192-5d78-4aed-8913-fdaf7314d9bc', 'Computer Science Engineering-AIML (AIML)', 'ALL', 6, '10:00:00', '14:00:00', '0c5b48f0-12cf-4d7a-836f-07c6f28c6fbe', 'SEMINAR CC1')
ON CONFLICT (id) DO NOTHING;

-- Branch: Information Technology (IT)
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('8a4944ef-2a41-4727-83cb-39bbf4adf2fe', 'Information Technology (IT)', 'ALL', 1, '13:00:00', '14:00:00', '2e8bf13e-257c-48a8-8fb4-c93009b38920', 'CR2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('5ee15303-068e-49d7-88cd-a629c05a8e29', 'Information Technology (IT)', 'ALL', 1, '15:00:00', '17:00:00', 'e2710ff5-e9c0-4e4f-89b5-013d45401aec', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('48fbe6a4-80b6-4356-8ed9-e90a6134ab77', 'Information Technology (IT)', 'IT2', 2, '08:00:00', '09:00:00', '52868744-61b0-4039-81d8-e58cbb8793e4', 'HW LAB 3RD FLOOR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('12e5e583-ada9-4b01-8c89-c414ce38df98', 'Information Technology (IT)', 'IT1', 2, '09:00:00', '10:00:00', '3157bbd3-88c4-4f60-86a9-af0b1ce9ab8e', 'MINOR ENV LAB 3RD FLOOR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('cc4e79fb-9bdd-44ea-81c8-a836520db1fa', 'Information Technology (IT)', 'ALL', 2, '10:00:00', '12:00:00', '270c6415-f40d-4c57-864c-efba88d5dad1', 'UB')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('ed25177b-c317-4d8b-856d-6bd29980d19f', 'Information Technology (IT)', 'IT1', 3, '08:00:00', '10:00:00', '0ea18d76-50db-418f-870d-22eebbfc57d3', 'HARDWARE LAB 3RD FLOOR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('7f139f0c-446f-4587-8ea0-0cfbaa503c9d', 'Information Technology (IT)', 'IT2', 3, '08:00:00', '10:00:00', '3157bbd3-88c4-4f60-86a9-af0b1ce9ab8e', 'LAB1 5TH FLOOR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('795546e5-b14f-4ca1-8d6f-adb0610183bd', 'Information Technology (IT)', 'IT2', 3, '10:00:00', '12:00:00', '0ea18d76-50db-418f-870d-22eebbfc57d3', 'HARDWARE LAB 3RD FLOOR')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('9ded52f5-5be8-4b48-807b-8c2303e5a284', 'Information Technology (IT)', 'IT1', 3, '10:00:00', '12:00:00', '52868744-61b0-4039-81d8-e58cbb8793e4', 'AR/VR 7TH FLOOR MPSTME')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('22ee99a4-768c-497b-825d-77da66187d63', 'Information Technology (IT)', 'ALL', 3, '10:00:00', '12:00:00', '4206b895-a613-4260-8fd5-3326919ceda3', 'CR2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('efe6ab6d-5321-42da-80cc-1828386454fa', 'Information Technology (IT)', 'ALL', 3, '12:00:00', '13:00:00', '4206b895-a613-4260-8fd5-3326919ceda3', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('d0fd0336-b4e6-4303-8333-126f2a2a88d9', 'Information Technology (IT)', 'ALL', 3, '13:00:00', '15:00:00', '2e8bf13e-257c-48a8-8fb4-c93009b38920', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('4e848b0c-31a3-4241-8db4-bc86f4a7c1f7', 'Information Technology (IT)', 'ALL', 3, '15:00:00', '16:00:00', '358c360c-1587-4218-8cbb-d17d339fbfe5', 'CC1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('b44eb9b7-cfd3-4893-8a2f-fcae0bc0941f', 'Information Technology (IT)', 'IT2', 4, '08:00:00', '10:00:00', '184f03f2-dcad-4a62-865d-cd6ddfbcd1be', 'HW Lab 3rd FLOOR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('e2ec657f-7969-4319-8c04-ecc08221c10d', 'Information Technology (IT)', 'ALL', 4, '08:00:00', '10:00:00', 'd4b3b76d-214b-4ba4-8211-3f745bfea174', 'CR OS CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('48fa093b-f64a-4960-814f-4923cfda2906', 'Information Technology (IT)', 'ALL', 4, '10:00:00', '12:00:00', '270c6415-f40d-4c57-864c-efba88d5dad1', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('1c98b62e-2ac8-4d2d-80cf-400314781e4a', 'Information Technology (IT)', 'ALL', 4, '13:00:00', '14:00:00', 'd4b3b76d-214b-4ba4-8211-3f745bfea174', 'CR OS CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('fb4c6c77-6281-47cd-80c7-187dda13d18f', 'Information Technology (IT)', 'ALL', 4, '15:00:00', '17:00:00', '358c360c-1587-4218-8cbb-d17d339fbfe5', 'CR24B')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('0a1a6746-8260-481c-8882-0166bb7477d3', 'Information Technology (IT)', 'ALL', 5, '08:00:00', '10:00:00', 'd4b3b76d-214b-4ba4-8211-3f745bfea174', 'CR OS CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('434d18e3-c9f4-4447-847f-1336e9a6bbc7', 'Information Technology (IT)', 'ALL', 5, '10:00:00', '12:00:00', '270c6415-f40d-4c57-864c-efba88d5dad1', 'CR1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('b15772dd-0d64-453e-8b81-025f76629f45', 'Information Technology (IT)', 'IT1', 5, '12:00:00', '14:00:00', '184f03f2-dcad-4a62-865d-cd6ddfbcd1be', 'DBMSL LAB-V 5TH FLR SBMP')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)
VALUES ('24ad22f6-5cea-4fbc-865a-5f61432b3373', 'Information Technology (IT)', 'ALL', 6, '08:00:00', '12:00:00', 'e4fd9c25-b114-4c83-81fc-666835c8a03c', 'UB')
ON CONFLICT (id) DO NOTHING;
