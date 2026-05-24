-- 1. Insert Data Pegawai Role VALTAKOD (1 Orang)
INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('Letkol Chb Dr. Hendro Susilo, S.T., M.T.', 'valtakod@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'VALTAKOD', 'Letnan Kolonel', 'Kasubbid Nomenklaskod', '081122334455', '1198001020000000');

-- 2. Insert Data Pegawai Role STAF_PUSKOD (1 Orang)
INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('PNS Rina Melati, S.Kom.', 'staf@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'STAF_PUSKOD', 'Penata Muda Tk. I - III/b', 'Staf Administrasi Kodifikasi', '081234567890', '198504122010122001');

-- 3. Insert Data Pegawai Role KATALOGER (7 Orang)
INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('Mayor Tek Andi Wijaya', 'kataloger1@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'KATALOGER', 'Mayor', 'Kataloger Ahli Madya', '081300000001', '512345');

INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('Kapten Laut (T) Dimas Prasetyo', 'kataloger2@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'KATALOGER', 'Kapten', 'Kataloger Ahli Muda', '081300000002', '523456');

INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('PNS Dedi Supriadi, S.T.', 'kataloger3@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'KATALOGER', 'Penata - III/c', 'Kataloger Ahli Muda', '081300000003', '198207152008011003');

INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('Lettu Lek Faisal Rahman', 'kataloger4@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'KATALOGER', 'Letnan Satu', 'Kataloger Ahli Pertama', '081300000004', '534567');

INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('PNS Siti Nurhaliza, A.Md.', 'kataloger5@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'KATALOGER', 'Pengatur - II/c', 'Kataloger Terampil', '081300000005', '199003212015022005');

INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('Kapten Cpl Hendra Gunawan', 'kataloger6@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'KATALOGER', 'Kapten', 'Kataloger Ahli Muda', '081300000006', '545678');

INSERT INTO "SYSTEM"."USERS" 
("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA", "NOMOR_IDENTITAS") 
VALUES 
('PNS Budi Wibowo, S.T.', 'kataloger7@kemhan.go.id', '$2b$10$QGzKYkUjlj2lKLq42.RNCuabE10NBtGajemc27GUO4oyJtROxoVNO', 'KATALOGER', 'Penata Muda Tk. I - III/b', 'Kataloger Ahli Pertama', '081300000007', '198711092012121007');

COMMIT;