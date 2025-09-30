<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'judul','deskripsi','tanggal_deadline','prioritas','selesai','butuh_perhatian'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
