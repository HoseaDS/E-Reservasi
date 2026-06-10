<!DOCTYPE html>
<html>
<head>
    <title>Laporan Reservasi Ruangan</title>
    <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        header { text-align: center; margin-bottom: 20px; }
    </style>
</head>
<body>
    <header>
        <h2>LAPORAN PEMINJAMAN RUANGAN</h2>
        <p>Kantor Walikota Administrasi Jakarta Timur</p>
    </header>
    <table>
        <thead>
            <tr>
                <th>Peminjam</th>
                <th>Ruangan</th>
                <th>Waktu Mulai</th>
                <th>Keperluan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($reservations as $row)
            <tr>
                <td>{{ $row->user->name }}</td>
                <td>{{ $row->facility->name }}</td>
                <td>{{ $row->start_time }}</td>
                <td>{{ $row->purpose }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>