<?php

// app/models/Keyword.php

class DataAccount extends Eloquent {

    protected $table = 'dataaccounts';      // not really needed due to defaults

    protected $fillable = array('dataaccount', 'user_id');     //make keyword field mass-assignable

	// one to many relation
	public function landingPageUrls()
	{
		return $this->hasMany('LandingPageUrl');
	}
}
