 <?php

class StopwordController extends \BaseController {

	/**
	 * Display a listing of the resource. (as JSON)
	 *
	 * @return Response
	 */
	public function index()
	{
        //return Response::json(Route::input());
        return Response::json(Stopword::get());
	}

	public function listStopwords($start, $count)
	{
        return Response::json( Stopword::skip($start)->take($count)->get() ); 
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function create()
	{
        Stopword::create(array(
            'stopword' => Input::get('stopword')
        ));

        return Response::json(array('success' => true)); 

	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
        Stopword::destroy($id);

        return Response::json(array('success' => true));
	}

}
