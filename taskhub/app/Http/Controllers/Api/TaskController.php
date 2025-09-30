<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function store(Request $request){
        $request->validate([
            'judul'=>'required|string',
            'deskripsi'=>'nullable|string',
            'tanggal_deadline'=>'required|date_format:d/m/Y',
            'prioritas'=>'required|in:rendah,sedang,tinggi'
        ]);

        $tanggal = Carbon::createFromFormat('d/m/Y', $request->tanggal_deadline)->format('Y-m-d');

        $butuhPerhatian = false;
        $kataKunci = ['urgent','klien'];
        foreach ($kataKunci as $kata) {
            if (str_contains(strtolower($request->judul.' '.$request->deskripsi ?? ''), $kata)) {
                $butuhPerhatian = true;
                break;
            }
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $task = $user->tasks()->create([
            'judul'=>$request->judul,
            'deskripsi'=>$request->deskripsi,
            'tanggal_deadline'=>$tanggal,
            'prioritas'=>$request->prioritas,
            'butuh_perhatian'=>$butuhPerhatian
        ]);
        
        $butuhPerhatian = false;
        $kataKunci = ['urgent','klien'];
        foreach ($kataKunci as $kata) {
            if (str_contains(strtolower($request->judul.' '.$request->deskripsi ?? ''), $kata)) {
                $butuhPerhatian = true;
                break;
            }
        }

        return response()->json($task);
    }

    public function index(Request $request){
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $query = $user->tasks();

        if($request->has('prioritas')){
            $query->where('prioritas',$request->prioritas);
        }

        if($request->has('status')){
            $query->where('selesai', $request->status=='selesai'?true:false);
        }

        if($request->has('sort') && $request->sort=='deadline'){
            $query->orderBy('tanggal_deadline');
        }

        return response()->json($query->get());
    }

    public function selesaikan($id){
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $task = $user->tasks()->findOrFail($id);
        $task->update(['selesai'=>true]);

        return response()->json($task);
    }

    public function reminder(){
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $today = Carbon::now('Asia/Jakarta');
        $tomorrow = $today->copy()->addDay()->toDateString();

        $tasks = $user->tasks()
            ->whereDate('tanggal_deadline',$tomorrow)
            ->get();

        return response()->json($tasks);
    }
}
